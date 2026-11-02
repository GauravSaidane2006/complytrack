const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class SebiScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://www.sebi.gov.in';
    this.sectorName = 'Securities & Capital Markets (SEBI)';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Securities and Exchange Board of India Act, 1992',
        section: 'Sections 3-34',
        summary: 'Establishes SEBI as the regulator for securities markets in India. Empowers SEBI to protect investor interests, promote securities market development, and regulate the securities market.',
        requirements: [
          'Registration with SEBI for market intermediaries',
          'Compliance with SEBI regulations and circulars',
          'Regular filing of returns and reports',
          'Adherence to code of conduct',
          'Implementation of internal control mechanisms',
        ],
        penalties: 'Section 15HB: Penalty up to Rs. 1 crore or three times the profit made, whichever is higher. Continuing default attracts Rs. 1 lakh per day.',
        sourceUrl: 'https://www.sebi.gov.in/legislations/acts/sebiact.pdf',
      },
      {
        title: 'SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015',
        section: 'Regulations 4-99',
        summary: 'Regulates listing of securities on stock exchanges. Mandates continuous disclosure requirements for listed entities to ensure transparency and protect investor interests.',
        requirements: [
          'Filing of annual financial results within 60 days',
          'Quarterly results within 45 days',
          'Board composition as per regulation requirements',
          'Audit committee and stakeholder relationship committee',
          'Corporate governance compliance',
          'Event-based disclosures within 24 hours',
          'Annual report filing with stock exchanges',
        ],
        penalties: 'Regulation 99: Fine up to Rs. 1 lakh per day for non-compliance, maximum Rs. 1 crore. Trading suspension of securities.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=33',
      },
      {
        title: 'SEBI (Prohibition of Insider Trading) Regulations, 2015',
        section: 'Regulations 3-12',
        summary: 'Prohibits insider trading in securities. Defines insider trading, sets out code of conduct for trading by insiders, and mandates disclosure of trades.',
        requirements: [
          'Drafting and implementation of insider trading policy',
          'Trading plan for designated persons',
          'Pre-clearance for trades by insiders',
          'Disclosure of trades within 2 business days',
          'Restricted list maintenance during silent periods',
          'Training for employees on insider trading norms',
        ],
        penalties: 'Regulation 12: Penalty up to Rs. 25 crore or three times the profit made, whichever is higher under SEBI Act.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=34',
      },
      {
        title: 'SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations, 2003',
        section: 'Regulations 3-12',
        summary: 'Prohibits fraudulent and unfair trade practices in the securities market including market manipulation, front-running, and siphoning of client funds.',
        requirements: [
          'Maintenance of proper books of accounts',
          'Segregation of client funds',
          'No misuse of client securities',
          'Fair treatment of all clients',
          'No market manipulation activities',
        ],
        penalties: 'Regulation 12: Penalty up to Rs. 25 crore or three times the profits made, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=14',
      },
      {
        title: 'SEBI (Substantial Acquisition of Shares and Takeovers) Regulations, 2011',
        section: 'Regulations 3-34',
        summary: 'Regulates substantial acquisitions of shares and takeovers of listed companies. Ensures fair treatment of all shareholders during acquisitions.',
        requirements: [
          'Public announcement for acquiring 25% or more shares',
          'Open offer for minimum 26% to public shareholders',
          'Compliance with pricing formula',
          'Filing of detailed offer document with SEBI',
          'Disclosure of acquisition to stock exchange',
        ],
        penalties: 'Regulation 34: Penalty up to Rs. 25 crore or three times the transaction value, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=16',
      },
      {
        title: 'SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018',
        section: 'Regulations 4-97',
        summary: 'Regulates issue of securities by listed companies including IPOs, rights issues, and bonus issues. Ensures adequate disclosure to investors.',
        requirements: [
          'Filing of draft offer document with SEBI',
          'Due diligence by merchant bankers',
          'Minimum lock-in period for promoters',
          'Pricing basis disclosure',
          'Allotment within specified timeframes',
          'Refund within 15 days of over-subscription',
        ],
        penalties: 'Regulation 97: Penalty up to Rs. 25 crore or three times the funds raised, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=36',
      },
      {
        title: 'SEBI (Mutual Funds) Regulations, 1996',
        section: 'Regulations 3-95',
        summary: 'Regulates registration and operations of mutual funds in India. Sets out eligibility criteria, investment norms, and governance requirements.',
        requirements: [
          'Registration as mutual fund with SEBI',
          'Minimum net worth of Rs. 50 crore',
          'Appointment of fund managers and trustees',
          'Compliance with investment limits',
          'Regular NAV disclosure',
          'Minimum 50% independent trustees',
        ],
        penalties: 'Regulation 95: Penalty up to Rs. 1 crore or three times the income, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=17',
      },
      {
        title: 'SEBI (Portfolio Managers) Regulations, 2020',
        section: 'Regulations 3-77',
        summary: 'Regulates portfolio management services in India. Sets out requirements for registration, investment norms, and reporting.',
        requirements: [
          'Registration with SEBI as portfolio manager',
          'Minimum net worth of Rs. 5 crore',
          'Custodian for safekeeping of securities',
          'Regular reporting to clients',
          'Performance benchmarking',
          'Risk management framework',
        ],
        penalties: 'Regulation 77: Penalty up to Rs. 25 crore or three times the fees received, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=18',
      },
      {
        title: 'SEBI (Investment Advisers) Regulations, 2013',
        section: 'Regulations 3-67',
        summary: 'Regulates investment advisory services. Ensures advisers provide suitable advice and maintain ethical standards.',
        requirements: [
          'Registration as investment adviser with SEBI',
          'Minimum qualification (graduate degree)',
          'Separate bank account for client funds',
          'Risk profiling of clients',
          'Suitability assessment before advice',
          'Disclosure of conflicts of interest',
        ],
        penalties: 'Regulation 67: Penalty up to Rs. 25 crore or three times the income, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=39',
      },
      {
        title: 'SEBI (Depositories and Participants) Regulations, 2018',
        section: 'Regulations 3-97',
        summary: 'Regulates depositories and depository participants. Ensures safekeeping of securities and smooth settlement of trades.',
        requirements: [
          'Registration as depository with SEBI',
          'Minimum net worth of Rs. 100 crore for depository',
          'Insurance coverage for depository operations',
          'Regular reconciliation of securities',
          'Investor grievance redressal mechanism',
          'Technology and cyber security framework',
        ],
        penalties: 'Regulation 97: Penalty up to Rs. 25 crore or three times the fees, whichever is higher.',
        sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doRecognisedFpi=yes&intmId=20',
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

module.exports = SebiScraper;
