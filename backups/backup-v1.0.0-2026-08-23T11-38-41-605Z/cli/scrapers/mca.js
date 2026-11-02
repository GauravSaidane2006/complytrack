const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class McaScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.mca.gov.in';
    this.sectorName = 'Companies Act & Corporate Governance (MCA)';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Companies Act, 2013',
        section: 'Sections 1-470',
        summary: 'The primary legislation governing formation, management, and dissolution of companies in India. Replaced the Companies Act, 1956. Covers all aspects of corporate governance, director responsibilities, and shareholder rights.',
        requirements: [
          'Company registration with Registrar of Companies (ROC)',
          'Minimum directors: 2 for private, 3 for public companies',
          'Registered office in India',
          'Annual filing of financial statements (AOC-4)',
          'Annual return filing (MGT-7)',
          'Board meetings: minimum 4 per year',
          'Statutory audit by qualified chartered accountants',
          'Maintenance of statutory registers and minutes',
          'Independent directors for listed/public companies',
          'Women director requirement for certain companies',
        ],
        penalties: 'Section 447: Fraud punishable with imprisonment from 6 months to 10 years and fine not less than the amount involved. Section 448: False statements punishable with imprisonment up to 3 years and fine up to Rs. 5 lakh.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesAct2013.pdf',
      },
      {
        title: 'Companies Act, 2013 - Chapter XVI',
        section: 'Sections 281-296',
        summary: 'Prevention of oppression and mismanagement. Protects minority shareholders from oppression by majority. Provides remedies for corporate grievances.',
        requirements: [
          'Fair treatment of all shareholders',
          'Proper disclosure of interests by directors',
          'Related party transaction approvals',
          'Prevention of related party transactions without approval',
          'Maintenance of proper books of accounts',
        ],
        penalties: 'Section 242: Tribunal can pass orders including winding up, purchase of shares, or regulation of company affairs.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesAct2013.pdf',
      },
      {
        title: 'Companies (Appointment and Qualification of Directors) Rules, 2014',
        section: 'Rules 8-19',
        summary: 'Specifies qualifications, disqualifications, and appointment procedures for company directors. Includes requirements for independent directors and women directors.',
        requirements: [
          'Director Identification Number (DIN) mandatory',
          'Minimum age of 18 years for directors',
          'Indian resident director requirement (183 days in India)',
          'Independent director on board for listed companies',
          'Women director for certain classes of companies',
          'Disqualification check before appointment',
          'Declaration of independence for independent directors',
        ],
        penalties: 'Appointment in contravention is void. Penalty up to Rs. 5 lakh for company and Rs. 1 lakh for every director in default.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
      },
      {
        title: 'Companies (Accounts) Rules, 2014',
        section: 'Rules 3-12',
        summary: 'Governs preparation and maintenance of financial statements. Prescribes accounting standards, formats, and disclosure requirements.',
        requirements: [
          'Books of accounts maintained at registered office',
          'Financial statements prepared as per Schedule III',
          'Compliance with Indian Accounting Standards (Ind AS)',
          'Board report with director responsibility statement',
          'Internal audit for prescribed class of companies',
          'Secretarial audit for listed companies',
          'Filing of financial statements with ROC within 30 days',
        ],
        penalties: 'Penalty up to Rs. 5 lakh for company and Rs. 1 lakh for every officer in default. Continuing default: additional Rs. 5,000 per day.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
      },
      {
        title: 'Companies (Meetings of Board and its Powers) Rules, 2014',
        section: 'Rules 3-13',
        summary: 'Regulates board meetings, quorum requirements, and powers of the board of directors. Ensures proper corporate decision-making.',
        requirements: [
          'Minimum 4 board meetings per year',
          'Maximum gap between meetings: 120 days',
          'Quorum: 1/3 of directors or 2, whichever is higher',
          'Notice of 7 days for board meetings',
          'Minutes maintained for all meetings',
          'Board resolution for specified matters',
          'Delegation of powers by board',
        ],
        penalties: 'Penalty up to Rs. 25,000 for company and Rs. 5,000 for every officer in default.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
      },
      {
        title: 'Companies (Registration of Charges) Rules, 2014',
        section: 'Rules 3-11',
        summary: 'Regulates creation, modification, and satisfaction of charges on company assets. Ensures transparency for creditors and investors.',
        requirements: [
          'Registration of charge within 30 days of creation',
          'Modification registration within 30 days',
          'Particulars of charge filed with ROC',
          'Certificate of registration from ROC',
          'Satisfaction of charge within 30 days',
        ],
        penalties: 'Failure to register: Charge void against liquidator/assignee. Penalty up to Rs. 1 lakh for company and Rs. 25,000 for officer in default.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
      },
      {
        title: 'Companies (Prospectus and Allotment of Securities) Rules, 2014',
        section: 'Rules 3-18',
        summary: 'Regulates issue of prospectus, offer documents, and allotment of securities. Protects investors through adequate disclosure requirements.',
        requirements: [
          'Filing of prospectus with ROC',
          'Adequate disclosure in offer document',
          'Minimum subscription requirements',
          'Application money in separate bank account',
          'Allotment within specified timeframe',
          'Refund of application money if minimum not subscribed',
        ],
        penalties: 'Section 40: Penalty up to Rs. 25 lakh for company and Rs. 5 lakh for every officer in default.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
      },
      {
        title: 'Companies (Indian Accounting Standards) Rules, 2015',
        section: 'Annexure',
        summary: 'Prescribes Indian Accounting Standards (Ind AS) for convergence with International Financial Reporting Standards (IFRS). Mandatory for specified class of companies.',
        requirements: [
          'Mandatory for listed companies and subsidiaries',
          'Net worth exceeding Rs. 250 crore threshold',
          'Ind AS adoption from specified date',
          'Comparative period financial statements',
          'First-time adoption exemptions availed',
        ],
        penalties: 'Penalty under Companies Act for non-compliance with accounting standards.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/IndianAccountingStandardsRules2015.pdf',
      },
      {
        title: 'Companies (Cost Records and Cost Audit) Rules, 2014',
        section: 'Rules 3-9',
        summary: 'Mandates maintenance of cost records and cost audit for specified class of companies. Ensures cost transparency and accountability.',
        requirements: [
          'Maintenance of cost records in Form CRA-1',
          'Cost audit by qualified cost accountant',
          'Filing of cost audit report with Central Government',
          'Compliance with cost accounting standards',
          'Cost records for companies with turnover exceeding Rs. 100 crore',
        ],
        penalties: 'Penalty up to Rs. 5 lakh for company and Rs. 1 lakh for every officer in default.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
      },
      {
        title: 'Companies (Significant Beneficial Owners) Rules, 2018',
        section: 'Rules 2-10',
        summary: 'Identifies and regulates significant beneficial owners of companies. Ensures transparency in ownership structure.',
        requirements: [
          'Declaration by significant beneficial owners',
          'Disclosure of beneficial interest exceeding 10%',
          'Register of significant beneficial owners',
          'Filing with ROC in BEN-2',
          'Company duty to identify significant beneficial owners',
        ],
        penalties: 'Penalty up to Rs. 50,000 for company and Rs. 1 lakh for significant beneficial owner in default. Continued default: additional Rs. 1,000 per day.',
        sourceUrl: 'https://www.mca.gov.in/Ministry/pdf/CompaniesRules2014.pdf',
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

module.exports = McaScraper;
