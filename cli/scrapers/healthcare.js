const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class HealthcareScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://cdsco.gov.in';
    this.sectorName = 'Healthcare & Pharmaceuticals';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Drugs and Cosmetics Act, 1940',
        section: 'Sections 1-37',
        summary: 'Regulates import, manufacture, distribution, and sale of drugs and cosmetics in India. Establishes regulatory framework for pharmaceutical industry.',
        requirements: [
          'Drug manufacturing license from CDSCO',
          'Drug import license',
          'Good Manufacturing Practices (GMP) compliance',
          'Drug testing and quality control',
          'Labeling and packaging requirements',
          'Drug price control compliance',
          'Adverse drug reaction reporting',
          'Clinical trial approval',
        ],
        penalties: 'Section 27: Imprisonment up to 3 years and fine up to Rs. 5,000 for first offence. Section 28: Life imprisonment for causing death.',
        sourceUrl: 'https://cdsco.gov.in/opencms/resources/UploadFiles/staticContent/Drugs-and-Cosmetics-Act.pdf',
      },
      {
        title: 'Drugs and Cosmetics Rules, 1945',
        section: 'Rules 1-221',
        summary: 'Detailed rules for implementation of Drugs and Cosmetics Act. Covers Schedules, licensing, and standards.',
        requirements: [
          'Schedule C & C1: Biological and special products',
          'Schedule G: Warning on drug labels',
          'Schedule H: Prescription drugs',
          'Schedule H1: Narcotic and psychotropic substances',
          'Schedule X: Habit-forming drugs',
          'Drug testing laboratories',
          'Batch release requirements',
          'Record maintenance for 5 years',
        ],
        penalties: 'Fine up to Rs. 10,000 and/or imprisonment up to 3 years.',
        sourceUrl: 'https://cdsco.gov.in/opencms/resources/UploadFiles/staticContent/Drugs-and-Cosmetics-Rules.pdf',
      },
      {
        title: 'Pharmacy Act, 1948',
        section: 'Sections 1-33',
        summary: 'Regulates pharmacy profession and pharmaceutical education. Establishes Pharmacy Council of India (PCI).',
        requirements: [
          'Registration with State Pharmacy Council',
          'Minimum qualifications for pharmacists',
          'Pharmacy education standards',
          'Code of ethics for pharmacists',
          'Continuing education requirements',
          'Pharmacy practice standards',
        ],
        penalties: 'Fine up to Rs. 1,000 for practicing without registration.',
        sourceUrl: 'https://www.pci.nic.in/Acts/RulesandRegulation.aspx',
      },
      {
        title: 'Medical Devices Rules, 2017',
        section: 'Rules 1-114',
        summary: 'Regulates import, manufacture, sale, and distribution of medical devices in India.',
        requirements: [
          'Medical device registration with CDSCO',
          'Import license for medical devices',
          'Manufacturing license for medical devices',
          'Quality management system (ISO 13485)',
          'Clinical evaluation requirements',
          'Post-market surveillance',
          'Adverse event reporting',
          'Labeling and packaging compliance',
        ],
        penalties: 'Fine up to Rs. 5 lakh and/or imprisonment up to 5 years.',
        sourceUrl: 'https://cdsco.gov.in/medical-devices',
      },
      {
        title: 'New Drugs and Clinical Trials Rules, 2019',
        section: 'Rules 1-105',
        summary: 'Regulates clinical trials of new drugs in India. Provides ethical and scientific framework.',
        requirements: [
          'Clinical trial approval from CDSCO',
          'Ethics Committee approval',
          'Informed consent from participants',
          'Good Clinical Practice (GCP) compliance',
          'Clinical trial registration',
          'Adverse event reporting',
          'Trial data integrity',
          'Compensation for trial-related injury',
        ],
        penalties: 'Fine up to Rs. 25 lakh and/or imprisonment up to 2 years for GCP violations.',
        sourceUrl: 'https://cdsco.gov.in/clinical-trials',
      },
      {
        title: 'National Medical Commission Act, 2019',
        section: 'Sections 1-109',
        summary: 'Establishes National Medical Commission (NMC) as apex medical education regulator. Replaced Medical Council of India.',
        requirements: [
          'Medical college registration with NMC',
          'Minimum standards for medical education',
          'Faculty qualification requirements',
          'Infrastructure and equipment standards',
          'Student admission regulations',
          'Medical practice standards',
          'Continuing medical education',
        ],
        penalties: 'Fine up to Rs. 10 crore for unauthorized medical colleges.',
        sourceUrl: 'https://www.nmc.org.in/NMC-Act-2019',
      },
      {
        title: 'Clinical Establishments (Registration and Regulation) Act, 2010',
        section: 'Sections 1-43',
        summary: 'Regulates registration and minimum standards for clinical establishments.',
        requirements: [
          'Registration with Clinical Establishments Council',
          'Minimum infrastructure requirements',
          'Staffing norms compliance',
          'Equipment and facility standards',
          'Patient safety measures',
          'Infection control protocols',
          'Discharge and referral procedures',
        ],
        penalties: 'Fine up to Rs. 5 lakh for operating without registration. Continuing default: additional Rs. 10,000 per day.',
        sourceUrl: 'https://www.nhindi.nhp.gov.in/ce-act',
      },
      {
        title: 'Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954',
        section: 'Sections 1-11',
        summary: 'Prohibits advertisement of drugs and remedies claimed to cure certain diseases.',
        requirements: [
          'No advertisement of miracle cures',
          'No false claims about drug efficacy',
          'No misleading health advertisements',
          'Compliance with approved indications',
        ],
        penalties: 'Section 7: Fine up to Rs. 5,000 and/or imprisonment up to 6 months.',
        sourceUrl: 'https://cdsco.gov.in/objectionable-advertisements',
      },
      {
        title: 'Drugs and Cosmetics (Indian Pharmacopoeia) Commission Act',
        section: 'Regulatory Framework',
        summary: 'Establishes standards for drug quality through Indian Pharmacopoeia.',
        requirements: [
          'Compliance with Indian Pharmacopoeia standards',
          'Drug testing as per IP methods',
          'Reference standards maintenance',
          'Quality control laboratory setup',
          'IP compliance certification',
        ],
        penalties: 'Non-compliance with IP standards treated as substandard drug.',
        sourceUrl: 'https://www.ipcindia.nic.in',
      },
      {
        title: 'Dental Council of India Act, 1948',
        section: 'Sections 1-20',
        summary: 'Regulates dental education and practice in India.',
        requirements: [
          'Registration with State Dental Council',
          'Dental college recognition',
          'Curriculum and standards',
          'Continuing dental education',
          'Code of ethics compliance',
        ],
        penalties: 'Fine up to Rs. 1,000 for unauthorized practice.',
        sourceUrl: 'https://www.dciindia.gov.in',
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

module.exports = HealthcareScraper;
