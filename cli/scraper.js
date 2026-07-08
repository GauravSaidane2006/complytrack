#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');
const { getScraper, getAllScrapers, getSectorList } = require('./scrapers');
const PdfBuilder = require('./utils/pdfBuilder');

const program = new Command();

program
  .name('complytrack-scraper')
  .description('CLI tool to scrape Indian compliance laws and generate PDFs')
  .version('1.0.0');

program
  .command('list')
  .description('List all available sectors')
  .action(() => {
    console.log(chalk.bold('\nAvailable Sectors:\n'));
    const sectors = getAllScrapers();
    sectors.forEach((sector, index) => {
      console.log(chalk.cyan(`${index + 1}. ${sector.name}`));
      console.log(chalk.gray(`   ID: ${sector.id}`));
      console.log(chalk.gray(`   ${sector.description}\n`));
    });
  });

program
  .command('scrape')
  .description('Scrape compliance laws and generate PDF')
  .option('-s, --sector <sector>', 'Scrape specific sector (use sector ID)')
  .option('-a, --all', 'Scrape all sectors')
  .option('-o, --output <directory>', 'Output directory', './output')
  .option('-f, --format <format>', 'Output format (pdf or json)', 'pdf')
  .action(async (options) => {
    const spinner = ora({ spinner: 'dots' });

    try {
      // Determine sectors to scrape
      let sectorsToScrape = [];

      if (options.all) {
        sectorsToScrape = getSectorList();
        console.log(chalk.bold('\nScraping ALL sectors...\n'));
      } else if (options.sector) {
        sectorsToScrape = [options.sector];
        console.log(chalk.bold(`\nScraping sector: ${options.sector}\n`));
      } else {
        console.log(chalk.red('\nPlease specify --sector <id> or --all\n'));
        console.log(chalk.yellow('Use "list" command to see available sectors\n'));
        process.exit(1);
      }

      // Create output directory
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(chalk.green(`Created output directory: ${outputDir}\n`));
      }

      // Scrape each sector
      const scrapedData = [];

      for (const sectorId of sectorsToScrape) {
        spinner.start(`Scraping ${sectorId}...`);
        try {
          const scraper = getScraper(sectorId);
          const data = await scraper.scrape();
          scrapedData.push(data);
          spinner.succeed(`Scraped ${data.sectorName}: ${data.regulations.length} regulations`);
        } catch (error) {
          spinner.fail(`Failed to scrape ${sectorId}: ${error.message}`);
          console.log(chalk.gray(`  Continuing with remaining sectors...\n`));
        }
      }

      if (scrapedData.length === 0) {
        console.log(chalk.red('\nNo data scraped. Exiting.\n'));
        process.exit(1);
      }

      // Generate output
      if (options.format === 'pdf') {
        spinner.start('Generating PDF...');
        const timestamp = new Date().toISOString().split('T')[0];
        const sectorLabel = scrapedData.length === 1
          ? scrapedData[0].sectorName.replace(/[^a-zA-Z0-9]/g, '_')
          : 'All_Sectors';
        const filename = `${sectorLabel}_${timestamp}.pdf`;
        const outputPath = path.join(outputDir, filename);

        const pdfBuilder = new PdfBuilder({
          title: 'Indian Compliance Laws Guide',
          info: {
            Title: 'Indian Compliance Laws Guide',
            Author: 'ComplyTrack India',
            Subject: 'Compliance Regulations Reference',
            Creator: 'ComplyTrack Scraper',
            CreationDate: new Date(),
          },
        });

        await pdfBuilder.generate(
          {
            sectors: scrapedData,
            generatedAt: new Date().toISOString(),
          },
          outputPath
        );

        spinner.succeed(`PDF generated: ${outputPath}`);
        console.log(chalk.green(`\nFile size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`));
      } else if (options.format === 'json') {
        spinner.start('Generating JSON...');
        const timestamp = new Date().toISOString().split('T')[0];
        const sectorLabel = scrapedData.length === 1
          ? scrapedData[0].sectorName.replace(/[^a-zA-Z0-9]/g, '_')
          : 'All_Sectors';
        const filename = `${sectorLabel}_${timestamp}.json`;
        const outputPath = path.join(outputDir, filename);

        const jsonData = {
          metadata: {
            title: 'Indian Compliance Laws Guide',
            generatedAt: new Date().toISOString(),
            sectorsScraped: scrapedData.length,
            totalRegulations: scrapedData.reduce((sum, s) => sum + s.regulations.length, 0),
          },
          sectors: scrapedData,
        };

        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
        spinner.succeed(`JSON generated: ${outputPath}`);
        console.log(chalk.green(`\nFile size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`));
      }

      // Print summary
      console.log(chalk.bold('\n--- Summary ---\n'));
      scrapedData.forEach(data => {
        console.log(chalk.cyan(`${data.sectorName}: ${data.regulations.length} regulations`));
      });
      console.log(chalk.bold(`\nTotal sectors: ${scrapedData.length}`));
      console.log(chalk.bold(`Total regulations: ${scrapedData.reduce((sum, s) => sum + s.regulations.length, 0)}`));
      console.log(chalk.green('\nDone!\n'));

    } catch (error) {
      spinner.fail('Error: ' + error.message);
      process.exit(1);
    }
  });

program.parse();
