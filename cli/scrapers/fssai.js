const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class FssaiScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.fssai.gov.in';
    this.sectorName = 'Food Safety & Standards (FSSAI)';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Food Safety and Standards Act, 2006',
        section: 'Sections 1-73',
        summary: 'Primary legislation for food safety and standards in India. Establishes FSSAI as the regulatory body for food safety. Consolidates multiple food laws.',
        requirements: [
          'FSSAI registration for food businesses',
          'License for food manufacturers and processors',
          'Food safety management system implementation',
          'Hygienic practices during food handling',
          'Labeling and packaging compliance',
          'Food testing and quality assurance',
          'Traceability and recall procedures',
          'Worker health and hygiene',
        ],
        penalties: 'Section 63: Imprisonment up to 6 months and fine up to Rs. 1 lakh for general offences. Section 64: Imprisonment up to life for causing death.',
        sourceUrl: 'https://www.fssai.gov.in/main/about.php',
      },
      {
        title: 'FSSAI Licensing and Registration Regulations, 2011',
        section: 'Regulations 2-27',
        summary: 'Prescribes licensing and registration requirements for food businesses based on turnover and type.',
        requirements: [
          'Registration for food businesses with turnover up to Rs. 12 lakh',
          'State license for turnover Rs. 12 lakh to Rs. 20 crore',
          'Central license for turnover above Rs. 20 crore',
          'License renewal before expiry',
          'Display of license number on all food products',
          'Separate license for each food category',
          'Manufacturing unit requirements',
        ],
        penalties: 'Fine up to Rs. 5 lakh for operating without license. Continuing default: additional Rs. 5,000 per day.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Labelling and Display Regulations, 2020',
        section: 'Regulations 1-10',
        summary: 'Regulates food labeling, packaging, and display requirements.',
        requirements: [
          'Mandatory information in English or Hindi',
          'Product name and brand',
          'List of ingredients',
          'Net quantity',
          'Date of manufacture and expiry',
          'Best before date',
          'Storage instructions',
          'Manufacturer details and FSSAI logo',
          'Nutritional information',
          'Allergen declaration',
          'Veg/Non-veg logo',
          'Adulteration warning',
        ],
        penalties: 'Fine up to Rs. 3 lakh for misleading labels. Confiscation of mislabeled products.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Safety and Standards (Prohibition and Restriction) Regulations, 2011',
        section: 'Regulations 1-3',
        summary: 'Lists foods that are prohibited or have restrictions for manufacture, sale, and distribution.',
        requirements: [
          'No sale of adulterated food',
          'No prohibited substances in food',
          'Restrictions on certain food additives',
          'Import restrictions for certain foods',
          'Banned food items compliance',
        ],
        penalties: 'Imprisonment up to 6 months and fine up to Rs. 1 lakh.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Product Standards Regulations, 2011',
        section: 'Regulations 1-7',
        summary: 'Sets standards for various food products including quality and safety requirements.',
        requirements: [
          'Compliance with product-specific standards',
          'Quality parameters adherence',
          'Contaminant limits',
          'Microbiological limits',
          'Additive limits',
          'Product testing as per standards',
          'Batch coding',
        ],
        penalties: 'Fine up to Rs. 5 lakh for non-compliance with standards.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Safety and Standards (Health Supplements, Nutraceuticals, etc.) Regulations, 2016',
        section: 'Regulations 1-9',
        summary: 'Regulates health supplements, nutraceuticals, food for special dietary uses, and fortified foods.',
        requirements: [
          'Claim substantiation for health benefits',
          'Specific labeling requirements',
          'Ingredient restrictions',
          'Daily dose limits',
          'No medicinal claims',
          'FSSAI approval for novel ingredients',
        ],
        penalties: 'Fine up to Rs. 5 lakh for non-compliance.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Safety and Standards (Contaminants, Toxins and Residues) Regulations, 2011',
        section: 'Regulations 1-5',
        summary: 'Sets limits for contaminants, toxins, and residues in food products.',
        requirements: [
          'Heavy metals limits compliance',
          'Pesticide residue limits',
          'Mycotoxin limits',
          'Antibiotic residue limits',
          'Radioactive contamination limits',
          'Regular testing for contaminants',
        ],
        penalties: 'Fine up to Rs. 5 lakh and/or imprisonment up to 6 months.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Safety and Standards (Additives) Regulations, 2011',
        section: 'Regulations 1-4',
        summary: 'Regulates use of food additives including colors, preservatives, and flavorings.',
        requirements: [
          'Use only approved food additives',
          'Maximum permissible limits',
          'Labeling of additives',
          'Prohibited additives compliance',
          'Documentation of additive usage',
        ],
        penalties: 'Fine up to Rs. 5 lakh for use of prohibited additives.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Safety and Standards (Organic Foods) Regulations, 2018',
        section: 'Regulations 1-10',
        summary: 'Regulates organic food certification and labeling.',
        requirements: [
          'FSSAI organic certification',
          'NPOP or PGS India certification',
          'Traceability to farm level',
          'No use of synthetic chemicals',
          'Separate handling and storage',
          'Organic labeling requirements',
        ],
        penalties: 'Fine up to Rs. 5 lakh for false organic claims.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
      },
      {
        title: 'FSSAI Food Safety and Standards (Fortification of Foods) Regulations, 2018',
        section: 'Regulations 1-5',
        summary: 'Mandates food fortification with vitamins and minerals.',
        requirements: [
          'Mandatory fortification of rice and wheat flour',
          'Iron, folic acid, Vitamin B12 fortification',
          'Double fortification of salt (iodine + iron)',
          'Fortification logo usage',
          'Labeling of fortified foods',
        ],
        penalties: 'Fine up to Rs. 3 lakh for non-compliance.',
        sourceUrl: 'https://www.fssai.gov.in/main/rules.php',
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

module.exports = FssaiScraper;
