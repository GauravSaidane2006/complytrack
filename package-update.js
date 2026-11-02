const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION = '2.0.0';
const ROOT = path.resolve(__dirname);
const TEMP_DIR = path.join(ROOT, 'temp-update');
const OUTPUT_FILE = path.join(ROOT, `complytrack-v${VERSION}.zip`);

// Files to include in the update
const SERVER_FILES = [
  'src/models/Organization.js',
  'src/services/trialService.js',
  'src/controllers/authController.js',
  'src/validators/authValidator.js',
  'src/middleware/licenseGate.js',
  'src/utils/emailService.js',
  'src/services/complianceService.js',
  'src/routes/trial.js',
  'src/routes/index.js',
  'src/routes/updates.js',
  'package.json'
];

const CLIENT_FILES = [
  'src/pages/RegistrationFlow.jsx',
  'src/components/common/TrialStatusBanner.jsx',
  'src/components/common/UpdateChecker.jsx',
  'src/store/api/api.js'
];

const UPDATE_CLIENT_FILES = [
  'index.js',
  'package.json'
];

console.log(`\nPackaging ComplyTrack Update v${VERSION}\n`);
console.log('='.repeat(50));

// Clean up
if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}

// Create temp directory structure
const serverDir = path.join(TEMP_DIR, 'server');
const clientDir = path.join(TEMP_DIR, 'client');
const updateClientDir = path.join(TEMP_DIR, 'update-client');

fs.mkdirSync(serverDir, { recursive: true });
fs.mkdirSync(clientDir, { recursive: true });
fs.mkdirSync(updateClientDir, { recursive: true });

// Copy server files
console.log('\nCopying server files...');
for (const file of SERVER_FILES) {
  const src = path.join(ROOT, 'server', file);
  const dest = path.join(serverDir, file);
  const destDir = path.dirname(dest);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ server/${file}`);
  } else {
    console.log(`  ✗ server/${file} (NOT FOUND)`);
  }
}

// Copy client files
console.log('\nCopying client files...');
for (const file of CLIENT_FILES) {
  const src = path.join(ROOT, 'client', file);
  const dest = path.join(clientDir, file);
  const destDir = path.dirname(dest);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ client/${file}`);
  } else {
    console.log(`  ✗ client/${file} (NOT FOUND)`);
  }
}

// Copy update-client files
console.log('\nCopying update-client files...');
for (const file of UPDATE_CLIENT_FILES) {
  const src = path.join(ROOT, 'update-client', file);
  const dest = path.join(updateClientDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ update-client/${file}`);
  } else {
    console.log(`  ✗ update-client/${file} (NOT FOUND)`);
  }
}

// Create ZIP
console.log('\nCreating ZIP archive...');
try {
  // Try 7zip first (Windows)
  execSync(`cd "${TEMP_DIR}" && 7z a "${OUTPUT_FILE}" .`, { stdio: 'pipe' });
  console.log(`Created: ${OUTPUT_FILE}`);
} catch {
  try {
    // Try PowerShell Compress-Archive
    execSync(`powershell -command "Compress-Archive -Path '${TEMP_DIR}\\*' -DestinationPath '${OUTPUT_FILE}' -Force"`, { stdio: 'pipe' });
    console.log(`Created: ${OUTPUT_FILE}`);
  } catch (e) {
    console.error('Failed to create ZIP. Install 7zip or use PowerShell.');
    console.log(`Temp files are at: ${TEMP_DIR}`);
    process.exit(1);
  }
}

// Cleanup temp dir
fs.rmSync(TEMP_DIR, { recursive: true, force: true });

// Show file size
const stats = fs.statSync(OUTPUT_FILE);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`\nFile size: ${sizeMB} MB`);
console.log('\nDone! Upload this file to the main server admin dashboard.');
