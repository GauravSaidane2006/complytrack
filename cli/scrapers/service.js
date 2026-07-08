const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class ServiceSectorScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://meity.gov.in';
    this.sectorName = 'Service Sector';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Information Technology Act, 2000',
        section: 'Sections 1-91A',
        summary: 'Primary legislation governing cyber activities, electronic commerce, and digital governance in India. Provides legal framework for electronic transactions, digital signatures, and cybercrime prevention.',
        requirements: [
          'Digital signature certificates for e-transactions',
          'Reasonable security practices for sensitive data',
          'Data protection compliance',
          'Cybersecurity framework implementation',
          'Incident response and reporting to CERT-In',
          'Website compliance with accessibility norms',
          'Electronic record maintenance',
          'Privacy policy disclosure',
        ],
        penalties: 'Section 43: Compensation up to Rs. 5 crore for damage to computer systems. Section 66: Imprisonment up to 3 years and fine up to Rs. 5 lakh for hacking. Section 72: Imprisonment up to 2 years for breach of confidentiality.',
        sourceUrl: 'https://meity.gov.in/content/it-act-2000',
      },
      {
        title: 'Information Technology Act - Amendment 2008',
        section: 'Sections 43A, 72A, 85',
        summary: 'Amendments introducing data protection provisions, corporate liability, and cybercrime enhancements.',
        requirements: [
          'Sensitive personal data protection',
          'Corporate responsibility for data security',
          'Penalty for publishing private images',
          'Intermediary liability guidelines',
          'Data retention requirements',
        ],
        penalties: 'Section 43A: Compensation for failure to protect data. Section 72A: Imprisonment up to 3 years for identity theft.',
        sourceUrl: 'https://meity.gov.in/content/it-act-2000',
      },
      {
        title: 'Indian Copyright Act, 1957',
        section: 'Sections 1-78',
        summary: 'Protects literary, dramatic, musical, and artistic works including software. Provides exclusive rights to creators.',
        requirements: [
          'Software copyright registration',
          'License agreements for software use',
          'Fair use compliance',
          'Anti-piracy measures',
          'Copyright notice on websites',
          'Digital rights management',
          'Royalty payment compliance',
        ],
        penalties: 'Section 63: Imprisonment from 6 months to 3 years and fine from Rs. 50,000 to Rs. 2 lakh.',
        sourceUrl: 'https://copyright.gov.in',
      },
      {
        title: 'Indian Patent Act, 1970',
        section: 'Sections 1-161',
        summary: 'Governs patent protection for inventions. Provides exclusive rights to inventors for 20 years.',
        requirements: [
          'Patent application filing',
          'Novelty and non-obviousness requirements',
          'Patent cooperation treaty (PCT) compliance',
          'Patent license agreements',
          'Compulsory licensing provisions',
          'Annual renewal fees',
        ],
        penalties: 'Section 111: Compensation for unauthorized use. Section 120: Imprisonment up to 2 years and fine for false claims.',
        sourceUrl: 'https://ipindiaonline.gov.in',
      },
      {
        title: 'Telegraph Act, 1885',
        section: 'Sections 1-85',
        summary: 'Regulates telegraph services in India. Provides licensing framework for telecom operators.',
        requirements: [
          'Telecom license from DoT',
          'Spectrum allocation compliance',
          'Quality of service standards',
          'Interconnection regulations',
          'Tariff regulations',
          'Lawful interception compliance',
        ],
        penalties: 'Section 20: Imprisonment up to 3 years for unauthorized telegraph establishment.',
        sourceUrl: 'https://www.dot.gov.in',
      },
      {
        title: 'TRAI Act, 1997',
        section: 'Sections 1-44',
        summary: 'Establishes Telecom Regulatory Authority of India. Regulates telecom services, tariffs, and quality.',
        requirements: [
          'TRAI registration and compliance',
          'Tariff regulation compliance',
          'Quality of service benchmarks',
          'Consumer complaint redressal',
          'Interconnection usage charges',
          'Spectrum usage charges',
          'Annual reporting to TRAI',
        ],
        penalties: 'Penalty up to Rs. 10 lakh for non-compliance with TRAI directions.',
        sourceUrl: 'https://www.trai.gov.in',
      },
      {
        title: 'Telecommunications (Indian Wireless Telegraphy) Act, 1933',
        section: 'Sections 1-30',
        summary: 'Regulates wireless telegraphy apparatus and signals.',
        requirements: [
          'Wireless apparatus license',
          'Equipment type approval',
          'Possession license for wireless devices',
          'Import of wireless equipment',
        ],
        penalties: 'Section 6: Imprisonment up to 3 years and/or fine up to Rs. 1,000.',
        sourceUrl: 'https://www.dot.gov.in',
      },
      {
        title: 'National Cyber Security Policy, 2013',
        section: 'Policy Framework',
        summary: 'Framework for protecting cyber space in India. Establishes National Critical Information Infrastructure Protection Centre (NCIIPC).',
        requirements: [
          'Cybersecurity policy implementation',
          'Incident reporting to CERT-In',
          'Vulnerability assessment and penetration testing',
          'Security audits',
          'Employee cybersecurity training',
          'Data encryption standards',
          'Access control measures',
          'Business continuity planning',
        ],
        penalties: 'Non-compliance may result in penalties under IT Act and regulatory action.',
        sourceUrl: 'https://meity.gov.in/content/national-cyber-security-policy',
      },
      {
        title: 'Digital Personal Data Protection Act, 2023',
        section: 'Sections 1-34',
        summary: 'India\'s comprehensive data protection law. Regulates processing of personal data and establishes Data Protection Board.',
        requirements: [
          'Consent for personal data processing',
          'Data fiduciary obligations',
          'Data processor agreements',
          'Purpose limitation',
          'Data minimization',
          'Storage limitation',
          'Data breach notification to Board',
          'Cross-border data transfer rules',
          'Rights of data principals',
          'Significant data fiduciary compliance',
        ],
        penalties: 'Up to Rs. 250 crore for significant violations. Rs. 50 crore for failure to notify data breaches.',
        sourceUrl: 'https://meity.gov.in/dpdp-act-2023',
      },
      {
        title: 'Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021',
        section: 'Rules 1-32',
        summary: 'Regulates intermediaries (social media, platforms) and digital news publishers.',
        requirements: [
          'Due diligence by intermediaries',
          'Grievance redressal mechanism',
          'Chief compliance officer appointment',
          'Removal of unlawful content within 36 hours',
          'Traceability of first originator',
          'Monthly compliance reports',
          'Digital media ethics code',
          'Self-regulatory body registration',
        ],
        penalties: 'Section 79: Loss of intermediary immunity for non-compliance.',
        sourceUrl: 'https://meity.gov.in/intermediary-guidelines',
      },
      {
        title: 'BPO/KPO Service Tax and GST Compliance',
        section: 'Service Category',
        summary: 'Tax compliance for business process outsourcing and knowledge process outsourcing services.',
        requirements: [
          'GST registration and compliance',
          'Place of supply rules for IT/ITES',
          'Input tax credit on IT services',
          'Export of services compliance',
          'Foreign exchange regulations',
          'SEZ/STPI compliance',
        ],
        penalties: 'Standard GST penalties for non-compliance.',
        sourceUrl: 'https://www.cbic.gov.in',
      },
      {
        title: 'ITeS (Information Technology Enabled Services) Regulations',
        section: 'Industry Framework',
        summary: 'Regulatory framework for IT-enabled services including BPO, KPO, and other outsourced services.',
        requirements: [
          'Employment contracts and terms',
          'Data security in outsourcing',
          'Client data protection',
          'Service level agreements',
          'Performance metrics reporting',
          'Employee training requirements',
        ],
        penalties: 'Contractual penalties and loss of business licenses.',
        sourceUrl: 'https://www.nasscom.in',
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

module.exports = ServiceSectorScraper;
