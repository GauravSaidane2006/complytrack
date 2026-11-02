#!/usr/bin/env node

const UpdateClient = require('./index');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  const client = new UpdateClient({
    mainServerUrl: process.env.MAIN_SERVER_URL || 'http://localhost:5100',
    apiKey: process.env.COMPLYTRACK_API_KEY
  });

  try {
    switch (command) {
      case 'check': {
        console.log('Checking for updates...\n');
        const result = await client.checkForUpdates();

        if (!result.hasUpdate) {
          console.log('✓ You are running the latest version.\n');
          console.log('Latest versions:', result.latestVersions);
        } else {
          console.log('⬇ Updates available:\n');
          for (const update of result.updates) {
            console.log(`  Component: ${update.component}`);
            console.log(`  Current:   v${update.currentVersion}`);
            console.log(`  Available: v${update.availableVersion}`);
            console.log(`  Released:  ${new Date(update.releaseDate).toLocaleDateString()}`);
            console.log(`  Stable:    ${update.isStable ? 'Yes' : 'No'}`);
            console.log(`\n  Patch Notes:\n  ${update.patchNotes.split('\n').join('\n  ')}\n`);

            if (update.changelog && update.changelog.length > 0) {
              console.log('  Changes:');
              for (const change of update.changelog) {
                console.log(`    [${change.category}] ${change.description}`);
              }
            }
            console.log('');
          }
        }
        break;
      }

      case 'apply': {
        console.log('Checking for updates...\n');
        const result = await client.checkForUpdates();

        if (!result.hasUpdate) {
          console.log('✓ You are already up to date.');
          break;
        }

        console.log('Available updates:');
        result.updates.forEach((u, i) => {
          console.log(`  ${i + 1}. ${u.component} v${u.availableVersion}`);
        });

        const choice = await prompt('\nSelect update number (or "q" to quit): ');
        if (choice === 'q') break;

        const idx = parseInt(choice) - 1;
        if (idx < 0 || idx >= result.updates.length) {
          console.log('Invalid selection');
          break;
        }

        const update = result.updates[idx];
        const confirm = await prompt(`\nApply ${update.component} v${update.availableVersion}? (y/N): `);

        if (confirm.toLowerCase() !== 'y') {
          console.log('Update cancelled');
          break;
        }

        const backupResult = await client.applyUpdate(update);
        console.log('\nUpdate applied successfully!');
        console.log('Backup location:', backupResult.backupPath);
        break;
      }

      case 'changelog': {
        const limit = parseInt(args[1]) || 5;
        console.log(`Fetching last ${limit} releases...\n`);
        const versions = await client.getChangelog(limit);

        if (versions.length === 0) {
          console.log('No versions found');
        } else {
          for (const v of versions) {
            console.log(`v${v.version} (${v.component}) - ${new Date(v.releaseDate).toLocaleDateString()}${v.isLatest ? ' [LATEST]' : ''}`);
            console.log(`  ${v.patchNotes.split('\n')[0]}\n`);
          }
        }
        break;
      }

      case 'version': {
        console.log(`Current version: v${client.currentVersion}`);
        console.log(`Component: ${client.component}`);
        console.log(`Main server: ${client.mainServerUrl}`);
        break;
      }

      default:
        console.log('ComplyTrack Update Client\n');
        console.log('Usage: node check.js <command>\n');
        console.log('Commands:');
        console.log('  check      Check for available updates');
        console.log('  apply      Download and apply an update');
        console.log('  changelog  View recent changelog');
        console.log('  version    Show current version info');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
