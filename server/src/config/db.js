const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

let mongoServer = null;

const PERSISTENT_DATA_DIR = path.join(__dirname, '../../data');

function cleanStaleLockFiles() {
  const lockFiles = ['mongod.lock', 'WiredTiger.lock'];
  for (const lockFile of lockFiles) {
    const lockPath = path.join(PERSISTENT_DATA_DIR, lockFile);
    if (fs.existsSync(lockPath)) {
      try {
        const content = fs.readFileSync(lockPath, 'utf8').trim();
        if (content) {
          const pid = parseInt(content, 10);
          if (!isNaN(pid)) {
            try {
              process.kill(pid, 0);
              console.log(`Lock file ${lockFile} belongs to active process ${pid} — skipping cleanup`);
              return false;
            } catch {
              console.log(`Stale lock file ${lockFile} (pid ${pid} dead) — removing`);
            }
          }
        }
        fs.unlinkSync(lockPath);
        console.log(`Removed stale lock file: ${lockFile}`);
      } catch (err) {
        console.error(`Warning: could not remove ${lockFile}: ${err.message}`);
      }
    }
  }
  return true;
}

function killZombieMongod() {
  // Only kill mongod processes that use OUR data dir — never other apps'
  // (e.g. the main server's own in-memory MongoDB).
  const dbPath = PERSISTENT_DATA_DIR;
  try {
    if (process.platform === 'win32') {
      const script =
        '$p = $env:CT_DBPATH; ' +
        'Get-CimInstance Win32_Process | ' +
        'Where-Object { $_.Name -like "mongod*" -and $_.CommandLine -like ("*" + $p + "*") } | ' +
        'ForEach-Object { $_.ProcessId }';
      const output = execSync('powershell -NoProfile -Command -', {
        encoding: 'utf8',
        input: script,
        env: { ...process.env, CT_DBPATH: dbPath }
      });
      const pids = output.split(/\s+/).map(s => s.trim()).filter(s => /^\d+$/.test(s));
      for (const pid of pids) {
        try {
          process.kill(parseInt(pid, 10), 0);
          console.log(`Killing stale mongod process ${pid} (dbpath ${dbPath})`);
          execSync(`taskkill /PID ${pid} /F 2>nul`);
        } catch {}
      }
    } else {
      const escaped = String(dbPath).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      execSync(`pkill -f "mongod.*${escaped}"`, { stdio: 'ignore' });
    }
  } catch {}
}

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri.startsWith('mongodb://atlas-sql')) {
      console.log('No remote MongoDB configured. Starting local MongoDB with persistent storage...');

      if (!fs.existsSync(PERSISTENT_DATA_DIR)) {
        fs.mkdirSync(PERSISTENT_DATA_DIR, { recursive: true });
      }

      killZombieMongod();
      cleanStaleLockFiles();

      mongoServer = await MongoMemoryServer.create({
        instance: {
          startupTimeoutMS: 60000,
          dbPath: PERSISTENT_DATA_DIR,
          storageEngine: 'wiredTiger',
        },
      });
      uri = mongoServer.getUri();
      console.log('Local MongoDB started at', uri, '(persistent data:', PERSISTENT_DATA_DIR, ')');
    }

    const conn = await mongoose.connect(uri);
    console.log('MongoDB Connected');
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (error.message.includes('DBPathInUse') || error.message.includes('lock file')) {
      console.log('Attempting to clean lock files and retry...');
      cleanStaleLockFiles();
      killZombieMongod();

      try {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            startupTimeoutMS: 60000,
            dbPath: PERSISTENT_DATA_DIR,
            storageEngine: 'wiredTiger',
          },
        });
        const uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log('MongoDB Connected (after lock cleanup)');
        return conn;
      } catch (retryError) {
        console.error(`MongoDB retry failed: ${retryError.message}`);
      }
    }

    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await disconnectDB();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error during shutdown:', err.message);
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
