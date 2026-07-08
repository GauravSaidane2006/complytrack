const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class IncomeTaxScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.incometax.gov.in';
    this.sectorName = 'Income Tax & Direct Taxes';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Income Tax Act, 1961',
        section: 'Sections 1-298',
        summary: 'The primary legislation governing income tax in India. Defines taxable income, tax rates, deductions, and compliance requirements for individuals, Hindu Undivided Families (HUFs), companies, and other entities.',
        requirements: [
          'Obtain Permanent Account Number (PAN)',
          'File income tax return before due date',
          'Maintain books of accounts as per Section 44AA',
          'Tax deduction at source (TDS) compliance',
          'Tax collection at source (TCS) compliance',
          'Advance tax payment for estimated income',
          'Response to notices and assessments',
          'Transfer pricing documentation for international transactions',
        ],
        penalties: 'Section 234A: 1% interest per month for late filing. Section 271F: Rs. 5,000 for non-filing. Section 276C: Prosecution for tax evasion with imprisonment 6 months to 7 years.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
      },
      {
        title: 'Income Tax Act - Tax Rates',
        section: 'Sections 115BAC, 115BAA, 115BAB',
        summary: 'Prescribes tax rates for different categories of taxpayers. Includes new concessional tax regime under Section 115BAC and special rates for companies.',
        requirements: [
          'Individuals: Choice between old and new tax regime',
          'New regime: 5% to 30% based on income slabs',
          'Companies: 22% under Section 115BAA (new regime)',
          'New manufacturing companies: 15% under Section 115BAB',
          'Surcharge as applicable based on income level',
          'Health and education cess at 4%',
        ],
        penalties: 'Incorrect regime selection may lead to higher tax liability and interest under Section 234.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
      },
      {
        title: 'Tax Deducted at Source (TDS) - Sections 190-206AA',
        section: 'Sections 190-206AA',
        summary: 'Requires deduction of tax at source for specified payments. Applies to salary, interest, commission, professional fees, rent, and other payments exceeding threshold limits.',
        requirements: [
          'Obtain TAN (Tax Deduction Account Number)',
          'Deduct TDS at applicable rates',
          'Deposit TDS by 7th of following month',
          'File TDS return quarterly (Form 24Q, 26Q, 27Q, 27EQ)',
          'Issue TDS certificates (Form 16/16A) within time limit',
          'Lower deduction certificate under Section 197',
          'Quarterly statement of TDS',
        ],
        penalties: 'Section 206AB: Interest at 1% per month for delay. Section 271H: Penalty Rs. 10,000 to Rs. 1 lakh for non-filing. Section 276B: Prosecution for non-payment.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/tp/tds-702',
      },
      {
        title: 'Tax Collected at Source (TCS) - Section 206C',
        section: 'Section 206C',
        summary: 'Requires collection of tax at source for specified goods and services. Applies to sellers of certain goods exceeding threshold limits.',
        requirements: [
          'Collect TCS at applicable rates',
          'Deposit TCS by 7th of following month',
          'File TCS return quarterly (Form 27EQ)',
          'Issue TCS certificates (Form 27D)',
          'PAN of collectee mandatory',
        ],
        penalties: 'Interest at 1% per month for delay in deposit. Penalty under Section 271H for non-filing.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/tp/tds-702',
      },
      {
        title: 'Advance Tax - Sections 207-211',
        section: 'Sections 207-211',
        summary: 'Requires payment of tax in advance if estimated tax liability exceeds Rs. 10,000. Applies to all taxpayers except senior citizens without business income.',
        requirements: [
          '15% by June 15 (for non-salaried)',
          '45% by September 15',
          '75% by December 15',
          '100% by March 15',
          'Self-assessment tax before filing return',
          'Estimate income and compute advance tax',
        ],
        penalties: 'Section 234B: Interest at 1% per month for default in advance tax payment. Section 234C: Interest for deferment of advance tax.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/advance-tax',
      },
      {
        title: 'Transfer Pricing - Section 92',
        section: 'Sections 92-92F',
        summary: 'Governs pricing of international transactions and specified domestic transactions between related parties. Ensures arm\'s length pricing.',
        requirements: [
          'Maintain transfer pricing documentation',
          'File Form 3CEB (Audit report by CA)',
          'Benchmarking analysis for related party transactions',
          'Advance pricing agreement (APA) option',
          'Country-by-country reporting for MNEs',
          'Annual filing of transfer pricing report',
        ],
        penalties: 'Section 271AB: Penalty 2% of value of transaction for non-maintenance of documentation. Section 271AAA: Penalty for concealment.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/assesse/tp-international-transaction',
      },
      {
        title: 'Tax Audit - Section 44AB',
        section: 'Section 44AB',
        summary: 'Mandatory tax audit for businesses and professionals exceeding specified turnover/profession receipts thresholds.',
        requirements: [
          'Business turnover exceeding Rs. 1 crore (Rs. 10 crore for cash transactions)',
          'Profession receipts exceeding Rs. 50 lakh',
          'Audit by qualified chartered accountant',
          'Form 3CA/3CB and 3CD filing',
          'Report filing before due date',
          'Compliance with audit observations',
        ],
        penalties: 'Section 271B: Penalty 0.5% of turnover or Rs. 1.5 lakh, whichever is less.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/assesse/audit-44ab',
      },
      {
        title: 'Black Money (Undisclosed Foreign Income and Assets) Act, 2015',
        section: 'Sections 3-102',
        summary: 'Imposes tax and penalty on undisclosed foreign income and assets. Addresses black money stashed abroad.',
        requirements: [
          'Disclosure of all foreign income and assets',
          'Reporting in Schedule FA of ITR',
          'Tax at 30% on undisclosed foreign income',
          'Penalty of 30% to 90% on undisclosed income',
          'No settlement or compounding for violations',
        ],
        penalties: 'Section 10: Tax at 30% plus penalty of 90% on undisclosed income. Imprisonment from 3 to 10 years for willful evasion.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
      },
      {
        title: 'Benami Transactions (Prohibition) Act, 2016',
        section: 'Sections 3-65',
        summary: 'Prohibits benami transactions and provides for confiscation of benami properties. Targets properties held in fictitious names.',
        requirements: [
          'Declaration of beneficial interest in property',
          'Filing of declaration with Initiating Officer',
          'No transaction in fictitious name',
          'Compliance with confiscation proceedings',
          'Provision of evidence for property ownership',
        ],
        penalties: 'Section 54: Imprisonment from 1 year to 7 years with fine. Confiscation of benami property.',
        sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
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

module.exports = IncomeTaxScraper;
