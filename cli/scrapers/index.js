const RbiScraper = require('./rbi');
const SebiScraper = require('./sebi');
const McaScraper = require('./mca');
const IncomeTaxScraper = require('./incomeTax');
const GstScraper = require('./gst');
const LabourScraper = require('./labour');
const EpfScraper = require('./epf');
const EnvironmentScraper = require('./environment');
const FssaiScraper = require('./fssai');
const HealthcareScraper = require('./healthcare');
const ServiceScraper = require('./service');
const ManufacturingScraper = require('./manufacturing');
const AgricultureScraper = require('./agriculture');

const scrapers = {
  rbi: { name: 'RBI/Banking', scraper: RbiScraper, description: 'Reserve Bank of India and Banking Regulations' },
  sebi: { name: 'SEBI/Markets', scraper: SebiScraper, description: 'Securities and Exchange Board of India Regulations' },
  mca: { name: 'Companies Act', scraper: McaScraper, description: 'Ministry of Corporate Affairs and Companies Act' },
  incomeTax: { name: 'Income Tax', scraper: IncomeTaxScraper, description: 'Income Tax and Direct Taxes' },
  gst: { name: 'GST', scraper: GstScraper, description: 'Goods and Services Tax Regulations' },
  labour: { name: 'Labour Laws', scraper: LabourScraper, description: 'Employment and Labour Laws' },
  epf: { name: 'EPF/ESI', scraper: EpfScraper, description: 'Employees Provident Fund and Insurance' },
  environment: { name: 'Environment', scraper: EnvironmentScraper, description: 'Environmental Protection and Pollution Control' },
  fssai: { name: 'FSSAI', scraper: FssaiScraper, description: 'Food Safety and Standards Authority of India' },
  healthcare: { name: 'Healthcare', scraper: HealthcareScraper, description: 'Healthcare and Pharmaceuticals' },
  service: { name: 'Service Sector', scraper: ServiceScraper, description: 'IT, Telecom, BPO, and Digital Services' },
  manufacturing: { name: 'Manufacturing Sector', scraper: ManufacturingScraper, description: 'Factories, Industrial, and Production' },
  agriculture: { name: 'Agriculture Sector', scraper: AgricultureScraper, description: 'Farming, Food Processing, and Rural' },
};

function getScraper(sectorId) {
  const scraper = scrapers[sectorId];
  if (!scraper) {
    throw new Error(`Unknown sector: ${sectorId}. Available: ${Object.keys(scrapers).join(', ')}`);
  }
  return new scraper.scraper();
}

function getAllScrapers() {
  return Object.entries(scrapers).map(([id, config]) => ({
    id,
    name: config.name,
    description: config.description,
  }));
}

function getSectorList() {
  return Object.keys(scrapers);
}

module.exports = {
  getScraper,
  getAllScrapers,
  getSectorList,
  scrapers,
};
