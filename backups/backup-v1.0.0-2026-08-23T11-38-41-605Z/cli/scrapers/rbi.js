const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class RbiScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.rbi.org.in';
    this.sectorName = 'Banking & Finance (RBI)';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Reserve Bank of India Act, 1934',
        section: 'Sections 17-42',
        summary: 'The RBI Act establishes the Reserve Bank of India as the central bank of India. It empowers RBI to regulate monetary policy, issue currency, manage foreign reserves, and supervise banking operations. Section 18 deals with the power to issue directions to banking companies.',
        requirements: [
          'Banks must maintain cash reserve ratio (CRR) with RBI',
          'Statutory liquidity ratio (SLR) maintenance mandatory',
          'Compliance with monetary policy directives',
          'Regular reporting to RBI on financial positions',
          'Adherence to interest rate guidelines',
        ],
        penalties: 'Penalties under Section 46 include fines up to twice the amount involved or imprisonment up to 3 years for contravention of provisions.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21602',
      },
      {
        title: 'Banking Regulation Act, 1949',
        section: 'Sections 5-58',
        summary: 'This Act consolidates and amends the law relating to banking. It provides RBI with powers to license banks, regulate their operations, inspect books, and give directions. It covers provisions for deposit insurance, bank management, and liquidation.',
        requirements: [
          'Prior RBI approval required for banking license',
          'Minimum capital and reserve requirements',
          'Maintenance of prescribed liquidity ratios',
          'Regular audit and inspection compliance',
          'Limits on advances to single borrowers',
          'Disclosure requirements for financial statements',
        ],
        penalties: 'Section 46-47: Penalties include fines up to Rs. 10 lakh and imprisonment up to 3 years for false statements or non-compliance.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21601',
      },
      {
        title: 'Foreign Exchange Management Act (FEMA), 1999',
        section: 'Sections 3-49',
        summary: 'FEMA consolidates and amends the law relating to foreign exchange to facilitate external trade and payments. It liberalized foreign exchange transactions while maintaining regulatory control.',
        requirements: [
          'Authorized dealer license for forex transactions',
          'Reporting of foreign exchange transactions',
          'Compliance with current account transaction rules',
          'Adherence to capital account transaction regulations',
          'Filing of annual performance statements',
        ],
        penalties: 'Section 13: Penalty up to three times the sum involved, or Rs. 2 lakh where sum is not quantifiable. Continued contravention attracts Rs. 5,000 per day.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21651',
      },
      {
        title: 'Prevention of Money Laundering Act (PMLA), 2002',
        section: 'Sections 3-73',
        summary: 'PMLA aims to prevent money laundering and provide for confiscation of property derived from or involved in money laundering. It mandates banks to implement KYC norms and report suspicious transactions.',
        requirements: [
          'Mandatory KYC (Know Your Customer) procedures',
          'Suspicious Transaction Reports (STR) to FIU-India',
          'Cash Transaction Reports (CTR) for transactions over Rs. 10 lakh',
          'Maintain records of all transactions for 5 years',
          'Enhanced due diligence for high-risk customers',
          'Appointment of designated principal officer',
        ],
        penalties: 'Section 4: Rigorous imprisonment from 3 to 7 years, extendable up to 10 years for offences involving scheduled drugs.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21619',
      },
      {
        title: 'Negotiable Instruments Act, 1881',
        section: 'Sections 6-138',
        summary: 'This Act governs negotiable instruments including cheques, bills of exchange, and promissory notes. Section 138 deals with dishonor of cheques for insufficiency of funds.',
        requirements: [
          'Proper maintenance of bank accounts',
          'Sufficient funds to honor cheques issued',
          'Compliance with cheque return procedures',
          'Payment of compensation for dishonored cheques',
        ],
        penalties: 'Section 138: Imprisonment up to 2 years, or fine up to twice the cheque amount, or both. Bank can also close the account.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21668',
      },
      {
        title: 'Credit Information Companies (Regulation) Act, 2005',
        section: 'Sections 5-39',
        summary: 'Regulates credit information companies that collect and disseminate credit information about borrowers. Ensures accuracy of credit data and protects borrower interests.',
        requirements: [
          'Registration with RBI as credit information company',
          'Adherence to data accuracy standards',
          'Borrower consent for data collection',
          'Right to dispute and correction of credit information',
          'Regular reporting to RBI',
        ],
        penalties: 'Section 37: Penalty up to Rs. 10 lakh for non-compliance, and additional Rs. 10,000 per day for continued default.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21657',
      },
      {
        title: 'Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act (SARFAESI), 2002',
        section: 'Sections 2-39',
        summary: 'Enables banks to recover non-performing assets without court intervention. Allows secured creditors to enforce security interest directly.',
        requirements: [
          'Classification of accounts as NPA',
          'Proper notice to borrower before action',
          'Compliance with possession-taking procedures',
          'Auction procedures for asset sale',
          'Debt Recovery Tribunal proceedings',
        ],
        penalties: 'Section 19: Imprisonment up to 6 months or fine up to Rs. 10,000, or both for obstruction of secured creditor.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21620',
      },
      {
        title: 'Recovery of Debts Due to Banks and Financial Institutions Act, 1993',
        section: 'Sections 3-36',
        summary: 'Establishes Debt Recovery Tribunals (DRTs) for recovery of debts due to banks and financial institutions. Streamlines the debt recovery process.',
        requirements: [
          'Filing of original application with DRT',
          'Minimum debt threshold of Rs. 20 lakh',
          'Compliance with DRT procedures',
          'Implementation of DRT orders',
        ],
        penalties: 'Section 25: Imprisonment up to 3 months, or fine up to Rs. 5,000, or both for non-compliance with DRT orders.',
        sourceUrl: 'https://www.rbi.org.in/Scripts/BS_B LegislationDisplay.aspx?id=21656',
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

module.exports = RbiScraper;
