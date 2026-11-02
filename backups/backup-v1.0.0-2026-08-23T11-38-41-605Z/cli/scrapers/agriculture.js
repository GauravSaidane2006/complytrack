const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class AgricultureSectorScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://agricoop.nic.in';
    this.sectorName = 'Agriculture & Food Processing';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Agricultural Produce Market Committee Act (State Laws)',
        section: 'State-specific Provisions',
        summary: 'Regulates marketing of agricultural produce through APMCs. Establishes regulated market yards and licensing of traders.',
        requirements: [
          'License from APMC for trading in agricultural produce',
          'Payment within prescribed time limits',
          'Adherence to minimum support prices (MSP)',
          'Market fee payment',
          'Entry in market records',
          'Compliance with APMC bylaws',
        ],
        penalties: 'Fine and cancellation of license for violations.',
        sourceUrl: 'https://agricoop.nic.in',
      },
      {
        title: 'Essential Commodities Act, 1955',
        section: 'Sections 1-14',
        summary: 'Controls production, supply, and distribution of essential commodities including food items.',
        requirements: [
          'Stock limits for essential commodities',
          'License for storage and distribution',
          'Price control compliance',
          'Anti-hoarding measures',
          'Quality standards adherence',
        ],
        penalties: 'Section 7: Imprisonment up to 6 months and/or fine up to Rs. 1,000.',
        sourceUrl: 'https://agricoop.nic.in',
      },
      {
        title: 'Food Safety and Standards Act, 2006',
        section: 'Sections 1-73',
        summary: 'Regulates food safety and standards for all food businesses including agricultural produce processors.',
        requirements: [
          'FSSAI registration/license',
          'Food safety management system',
          'Hygiene and sanitary practices',
          'Labeling and packaging compliance',
          'Traceability system',
          'Testing and quality assurance',
          'Worker health and hygiene',
        ],
        penalties: 'Section 63: Imprisonment up to 6 months and fine up to Rs. 1 lakh.',
        sourceUrl: 'https://www.fssai.gov.in',
      },
      {
        title: 'Seeds Act, 1966',
        section: 'Sections 1-45',
        summary: 'Regulates quality and sale of seeds. Ensures availability of genuine quality seeds to farmers.',
        requirements: [
          'Seed certification from state certification agency',
          'Seed testing and quality standards',
          'Labeling requirements for seed packets',
          'Registration of seed varieties',
          'Seed dealer licensing',
          'Minimum seed purity standards',
        ],
        penalties: 'Section 15: Fine up to Rs. 1,000 for first offence. Section 16: Imprisonment up to 6 months for repeated offences.',
        sourceUrl: 'https://agricoop.nic.in',
      },
      {
        title: 'Plant Variety Protection and Farmers Rights Act, 2001',
        section: 'Sections 1-73',
        summary: 'Protects plant varieties and recognizes farmers rights. Implements UPOV Convention in India.',
        requirements: [
          'Plant variety registration',
          'Farmers right to save, use, sow and resow seeds',
          'Benefit sharing with farmers',
          'Compulsory licensing provisions',
          'Protection for 15-18 years',
          'Biodiversity register maintenance',
        ],
        penalties: 'Fine up to Rs. 5 lakh for infringement of registered varieties.',
        sourceUrl: 'https://plantauthority.gov.in',
      },
      {
        title: 'Insecticides Act, 1968',
        section: 'Sections 1-36',
        summary: 'Regulates import, manufacture, sale, and use of insecticides in India.',
        requirements: [
          'Registration of insecticides with CIB&RC',
          'Insecticide dealer licensing',
          'Safe handling and storage',
          'Labeling and packaging standards',
          'Restricted use zones',
          'Record maintenance',
        ],
        penalties: 'Section 29: Fine up to Rs. 1,000 for general offences. Section 30: Imprisonment up to 1 year for serious violations.',
        sourceUrl: 'https://agricoop.nic.in',
      },
      {
        title: 'Fertilizer Control Order, 1985',
        section: 'Regulatory Framework',
        summary: 'Regulates manufacture, sale, and distribution of fertilizers in India.',
        requirements: [
          'Fertilizer licensing under FCO',
          'Quality standards compliance',
          'MRP (Maximum Retail Price) adherence',
          'Labeling requirements',
          'Testing and certification',
          'Distribution norms',
        ],
        penalties: 'Imprisonment up to 1 year and fine up to Rs. 1,000.',
        sourceUrl: 'https://agricoop.nic.in',
      },
      {
        title: 'Agricultural Produce Grading and Marking Act, 1937',
        section: 'Sections 1-16',
        summary: 'Provides for grading and marking of agricultural and other produce.',
        requirements: [
          'AGMARK certification',
          'Grading as per prescribed standards',
          'Use of AGMARK for graded produce',
          'Quality testing by approved laboratories',
          'Record keeping',
        ],
        penalties: 'Fine up to Rs. 500 for misuse of AGMARK.',
        sourceUrl: 'https://agmarknet.gov.in',
      },
      {
        title: 'Land Acquisition Act, 2013',
        section: 'Sections 1-104',
        summary: 'Regulates acquisition of land for public purposes including industrial and infrastructure projects.',
        requirements: [
          'Social Impact Assessment (SIA)',
          'Consent of affected families (80%)',
          'Fair compensation at market value',
          'Rehabilitation and resettlement',
          'R&R package for affected families',
          'Gram Sabha consent',
        ],
        penalties: 'Imprisonment up to 3 years and fine for unauthorized acquisition.',
        sourceUrl: 'https://landresource.nic.in',
      },
      {
        title: 'Rural Employment and Agriculture',
        section: 'MGNREGA & PM-KISAN',
        summary: 'Schemes and regulations for rural employment guarantee and farmer welfare.',
        requirements: [
          'MGNREGA: 100 days guaranteed employment',
          'Wage payment within 15 days',
          'Worksite facilities',
          'Social audit',
          'PM-KISAN: Direct benefit transfer',
          'Farmer registration',
        ],
        penalties: 'Administrative action for non-implementation.',
        sourceUrl: 'https://nregastrep.nic.in',
      },
      {
        title: 'Pesticide Management Bill',
        section: 'Proposed Legislation',
        summary: 'Proposed bill to replace Insecticides Act, 1968. Regulates pesticide registration, manufacture, sale, and use.',
        requirements: [
          'Pesticide registration with Central Insecticide Board',
          'Safety testing and data submission',
          'Environmental impact assessment',
          'Proper labeling and packaging',
          'Dealer licensing',
          'Restrictions on hazardous pesticides',
        ],
        penalties: 'Enhanced penalties for violations.',
        sourceUrl: 'https://agricoop.nic.in',
      },
      {
        title: 'Agricultural Produce (Grading and Marking) Rules',
        section: 'AGMARK Standards',
        summary: 'Prescribes standards for grading of agricultural commodities.',
        requirements: [
          'Grading as per BIS standards',
          'Use of AGMARK logo',
          'Quality testing by approved labs',
          'Certification for export',
          'Periodic renewal of certification',
        ],
        penalties: 'Fine and cancellation of grading certificate.',
        sourceUrl: 'https://agmarknet.gov.in',
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

module.exports = AgricultureSectorScraper;
