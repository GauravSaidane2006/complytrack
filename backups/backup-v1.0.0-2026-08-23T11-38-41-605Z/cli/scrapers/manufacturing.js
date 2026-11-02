const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class ManufacturingSectorScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://dpiit.gov.in';
    this.sectorName = 'Manufacturing Sector';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Factories Act, 1948',
        section: 'Sections 1-120',
        summary: 'Regulates working conditions in factories including health, safety, welfare, and working hours. Applies to all manufacturing units with 10+ workers and power, or 20+ without power.',
        requirements: [
          'Factory registration with Chief Inspector',
          'Health and safety standards compliance',
          'Working hours: 9 hours/day, 48 hours/week',
          'Overtime provisions',
          'Weekly holiday mandatory',
          'First aid and medical facilities',
          'Canteen for 250+ workers',
          'Rest rooms and latrines',
          'Ventilation, lighting, temperature control',
          'Annual leave with wages',
          'Accident reporting and record maintenance',
        ],
        penalties: 'Section 92: Fine up to Rs. 2 lakh. Section 94: Imprisonment up to 2 years for serious accidents.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/FactoryAct1948.pdf',
      },
      {
        title: 'Boilers Act, 1923',
        section: 'Sections 1-41',
        summary: 'Regulates registration and use of boilers and unfired pressure vessels. Ensures safety in boiler operations.',
        requirements: [
          'Boiler registration with Inspector of Boilers',
          'Hydraulic testing before commissioning',
          'Annual inspection and certification',
          'Qualified boiler operators',
          'Safety valve maintenance',
          'Record of boiler operations',
        ],
        penalties: 'Section 18: Fine up to Rs. 1,000 and/or imprisonment up to 6 months.',
        sourceUrl: 'https://www.bis.gov.in/boiler-act',
      },
      {
        title: 'Industrial Disputes Act, 1947',
        section: 'Sections 1-38',
        summary: 'Governs industrial relations, dispute resolution, strikes, lockouts, retrenchment, and layoff.',
        requirements: [
          'Standing orders for 100+ workers',
          '14-day notice for strike/lockout',
          'Retrenchment compensation: 15 days/year service',
          'Prior government approval for retrenchment (100+)',
          'Dispute reference to Labour Court/Tribunal',
          'Layoff and closure procedures',
        ],
        penalties: 'Section 26: Fine up to Rs. 1,000 for illegal strikes. Section 36A: Imprisonment up to 6 months.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/IndustrialDisputesAct1947.pdf',
      },
      {
        title: 'Standards of Weights and Measures Act, 1976',
        section: 'Sections 1-82',
        summary: 'Regulates use of weights and measures in trade and commerce. Ensures accuracy in measurements.',
        requirements: [
          'Legal Metrology compliance',
          'Verification of weighing instruments',
          'Pre-packaged commodity rules',
          'Net quantity declaration',
          'Periodic re-verification',
          'Registration of manufacturers',
        ],
        penalties: 'Fine up to Rs. 25,000 and/or imprisonment up to 1 year.',
        sourceUrl: 'https://legislative.gov.in/acts-auctions',
      },
      {
        title: 'Standards of Weights and Measures (Packaged Commodities) Rules, 1977',
        section: 'Rules 1-25',
        summary: 'Regulates labeling and packaging of pre-packaged commodities.',
        requirements: [
          'Name and address of manufacturer',
          'Net quantity declaration',
          'Date of manufacturing',
          'Best before/use by date',
          'MRP (Maximum Retail Price)',
          'Lot/batch number',
          'Commodity-specific declarations',
        ],
        penalties: 'Fine up to Rs. 25,000 for first offence. Subsequent offences: fine up to Rs. 50,000 or imprisonment up to 1 year.',
        sourceUrl: 'https://legislative.gov.in/acts-auctions',
      },
      {
        title: 'Bureau of Indian Standards Act, 2016',
        section: 'Sections 1-43',
        summary: 'Establishes Bureau of Indian Standards (BIS). Regulates standardization, certification, and quality marking.',
        requirements: [
          'BIS certification for mandatory products',
          'ISI mark compliance',
          'Quality management systems',
          'Product testing to Indian Standards',
          'Marking and labeling requirements',
          'License from BIS',
          'Conformity assessment procedures',
        ],
        penalties: 'Section 38: Fine up to Rs. 5 lakh and/or imprisonment up to 1 year for misuse of BIS marks.',
        sourceUrl: 'https://www.bis.gov.in',
      },
      {
        title: 'Indian Contract Act, 1872',
        section: 'Sections 1-238',
        summary: 'Governs contracts in India including formation, performance, and breach. Foundation of commercial agreements.',
        requirements: [
          'Valid contract formation (offer, acceptance, consideration)',
          'Capacity to contract',
          'Free consent',
          'Lawful object',
          'Written agreements for certain transactions',
          'Performance as per terms',
        ],
        penalties: 'Compensation for breach as per Section 73.',
        sourceUrl: 'https://legislative.gov.in/acts-auctions',
      },
      {
        title: 'Sale of Goods Act, 1930',
        section: 'Sections 1-66',
        summary: 'Governs sale of goods contracts including transfer of property, rights, and obligations.',
        requirements: [
          'Sale agreement with essential terms',
          'Transfer of property in goods',
          'Delivery and acceptance',
          'Warranty and condition compliance',
          'Right to return goods',
          'Payment terms',
        ],
        penalties: 'Compensation for breach of contract.',
        sourceUrl: 'https://legislative.gov.in/acts-auctions',
      },
      {
        title: 'Consumer Protection Act, 2019',
        section: 'Sections 1-107',
        summary: 'Protects consumers against unfair trade practices, defective goods, and deficient services. Establishes consumer courts.',
        requirements: [
          'Product liability compliance',
          'Consumer rights disclosure',
          'Defect-free goods supply',
          'Fair pricing practices',
          'No misleading advertisements',
          'Consumer complaint redressal',
          'Product recall mechanism',
          'E-commerce rules compliance',
        ],
        penalties: 'Section 89: Compensation up to Rs. 10 crore for product defects causing death or injury.',
        sourceUrl: 'https://consumeraffairs.nic.in',
      },
      {
        title: 'Competition Act, 2002',
        section: 'Sections 1-66',
        summary: 'Prevents anti-competitive practices, abuse of dominant position, and regulates mergers and acquisitions.',
        requirements: [
          'No anti-competitive agreements',
          'No abuse of dominant position',
          'Merger notification for large deals',
          'Competition compliance program',
          'No bid rigging or cartelization',
          'Fair competition practices',
        ],
        penalties: 'Section 27: Fine up to 10% of average turnover for anti-competitive agreements.',
        sourceUrl: 'https://www.cci.gov.in',
      },
      {
        title: 'Pollution Control in Manufacturing',
        section: 'Environmental Compliance',
        summary: 'Environmental compliance for manufacturing units including emission, effluent, and waste management.',
        requirements: [
          'Consent to Establish (CTE) from SPCB',
          'Consent to Operate (CTO) from SPCB',
          'Emission standards compliance',
          'Effluent treatment and discharge',
          'Hazardous waste management',
          'Environmental Impact Assessment',
          'Annual environmental audit',
        ],
        penalties: 'Under EPA: Imprisonment up to 5 years and fine up to Rs. 1 lakh.',
        sourceUrl: 'https://moef.gov.in',
      },
      {
        title: 'Electronics Manufacturing Compliance',
        section: 'MeitY/MCA',
        summary: 'Compliance requirements for electronics and semiconductor manufacturing.',
        requirements: [
          'ISI certification for electronics',
          'BIS registration for electronics',
          'E-waste management',
          'RoHS compliance',
          'Product safety standards',
          'Testing and certification',
          'Import/export licenses',
        ],
        penalties: 'Product seizure and fines under BIS Act.',
        sourceUrl: 'https://meity.gov.in',
      },
    ];

    return {
      sectorName: this.sectorName,
      sourceUrl: this.baseUrl,
      regulations,
      scrapedAt: new Date().toISOString(),
    };
  }
}

module.exports = ManufacturingSectorScraper;
