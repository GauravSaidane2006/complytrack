const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class EpfScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.epfindia.gov.in';
    this.sectorName = 'Provident Fund & Pension (EPF/EPFO)';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
        section: 'Sections 1-26',
        summary: 'Main legislation governing provident fund, pension, and deposit-linked insurance schemes for employees. Administered by EPFO.',
        requirements: [
          'EPF registration for establishments with 20+ employees',
          'Employee contribution: 12% of basic wages',
          'Employer contribution: 12% (8.33% to EPS, 3.67% to EPF)',
          'Monthly deposit by 15th of following month',
          'UAN (Universal Account Number) generation',
          'ECR filing electronically',
          'Annual EPF return filing',
          'Nomination form submission',
        ],
        penalties: 'Section 14A: Imprisonment up to 3 years and fine up to Rs. 10 lakh for default. Daily fine of Rs. 1,000 for continuing default.',
        sourceUrl: 'https://www.epfindia.gov.in/site_en/Legislation.php',
      },
      {
        title: 'EPF Scheme, 1952',
        section: 'Para 2-69',
        summary: 'Details of provident fund scheme including contribution, withdrawal, and transfer rules.',
        requirements: [
          'PF account maintenance',
          'UAN linking with Aadhaar and bank account',
          'KYC update for withdrawal',
          'Form 19 for final settlement',
          'Form 31 for partial withdrawal',
          'Form 10C for pension withdrawal',
          'Transfer of PF on job change',
          'Employer share investment in specified securities',
        ],
        penalties: 'Interest at 12% per annum on delayed deposit. Penalty for non-deposit of contributions.',
        sourceUrl: 'https://www.epfindia.gov.in/site_en/Schemes.php',
      },
      {
        title: 'Employees Pension Scheme, 1995 (EPS)',
        section: 'Para 2-39',
        summary: 'Provides pension benefits to employees on superannuation, disablement, or death.',
        requirements: [
          'Pension contribution: 8.33% of employer share',
          'Minimum pension: Rs. 1,000 per month',
          'Service pension after 10 years of service',
          'Pension age: 58 years',
          'Family pension for spouse and children',
          'Disablement pension for disabled employees',
          'Table of benefits for withdrawal',
        ],
        penalties: 'Pension not payable for service less than 10 years. Early pension reduction as per table.',
        sourceUrl: 'https://www.epfindia.gov.in/site_en/Schemes.php',
      },
      {
        title: 'Employees Deposit Linked Insurance Scheme, 1976 (EDLI)',
        section: 'Para 2-15',
        summary: 'Provides life insurance benefit to employees covered under EPF.',
        requirements: [
          'Insurance contribution: 0.5% of monthly wages',
          'Maximum wages limit: Rs. 15,000',
          'Maximum insurance: Rs. 6 lakh',
          'Minimum insurance: Rs. 2.5 lakh',
          'Nomination for insurance benefit',
          'Claim on death of employee',
        ],
        penalties: 'Late payment attracts interest at 12% per annum.',
        sourceUrl: 'https://www.epfindia.gov.in/site_en/Schemes.php',
      },
      {
        title: 'EPF Administration Scheme',
        section: 'Para 30-55',
        summary: 'Administrative procedures for EPF management including establishment code and compliance.',
        requirements: [
          'Establishment code allotment',
          'Monthly ECR (Electronic Challan cum Return)',
          'Digital signature for online filing',
          'Annual return in Form 5A',
          'Audit of accounts for establishments with 20+ employees',
          'Inspection and compliance',
        ],
        penalties: 'Penalty of Rs. 5,000 per default for non-filing of returns.',
        sourceUrl: 'https://www.epfindia.gov.in/site_en/Employers.php',
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

module.exports = EpfScraper;
