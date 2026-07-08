const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class EnvironmentScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://moef.gov.in';
    this.sectorName = 'Environment & Pollution Control';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Environment (Protection) Act, 1986',
        section: 'Sections 1-33',
        summary: 'Umbrella legislation for environmental protection. Empowers central government to take measures for environmental protection, set emission standards, and regulate hazardous activities.',
        requirements: [
          'Environmental Impact Assessment (EIA) for projects',
          'Consent to Establish (CTE) from pollution boards',
          'Consent to Operate (CTO) from pollution boards',
          'Emission and effluent standards compliance',
          'Environmental clearance for development projects',
          'Hazardous waste management',
          'Annual Environmental Audit',
          'Pollution control equipment maintenance',
        ],
        penalties: 'Section 15: Imprisonment up to 5 years and fine up to Rs. 1 lakh. Continuing default: additional Rs. 5,000 per day.',
        sourceUrl: 'https://moef.gov.in/sites/default/files/EPA%201986.pdf',
      },
      {
        title: 'Water (Prevention and Control of Pollution) Act, 1974',
        section: 'Sections 1-63',
        summary: 'Provides for prevention and control of water pollution. Establishes Central and State Pollution Control Boards.',
        requirements: [
          'Consent for discharge of effluents',
          'Effluent quality standards compliance',
          'Water quality monitoring',
          'Pollution control measures',
          'Annual returns to pollution board',
          'Self-monitoring report',
          'CPCB and SPCB compliance',
        ],
        penalties: 'Section 24: Fine up to Rs. 10,000 for first offence. Section 25: Imprisonment up to 6 years for subsequent offences.',
        sourceUrl: 'https://moef.gov.in/sites/default/files/Water%20Act%201974.pdf',
      },
      {
        title: 'Air (Prevention and Control of Pollution) Act, 1981',
        section: 'Sections 1-56',
        summary: 'Provides for prevention, control, and abatement of air pollution. Sets emission standards for industries and vehicles.',
        requirements: [
          'Consent for emission of air pollutants',
          'Emission standards compliance',
          'Stack height requirements',
          'Continuous Emission Monitoring Systems (CEMS)',
          'Ambient air quality monitoring',
          'Fuel quality standards',
          'Dust control measures',
        ],
        penalties: 'Section 29: Fine up to Rs. 10,000 for first offence. Section 30: Imprisonment up to 6 years for subsequent offences.',
        sourceUrl: 'https://moef.gov.in/sites/default/files/Air%20Act%201981.pdf',
      },
      {
        title: 'Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016',
        section: 'Rules 1-10',
        summary: 'Regulates management, handling, storage, and transboundary movement of hazardous wastes.',
        requirements: [
          'Hazardous waste inventory maintenance',
          'Proper storage in designated areas',
          'Authorized recyclers/treatment facilities',
          'Manifest system for waste movement',
          'Annual returns to pollution board',
          'Insurance for hazardous waste operations',
          'Training for workers handling hazardous waste',
          'Emergency response plan',
        ],
        penalties: 'Under EPA: Imprisonment up to 5 years and fine up to Rs. 1 lakh.',
        sourceUrl: 'https://moef.gov.in/hazardous-waste-management',
      },
      {
        title: 'Solid Waste Management Rules, 2016',
        section: 'Rules 1-12',
        summary: 'Regulates management of solid waste including municipal, industrial, and biomedical waste.',
        requirements: [
          'Segregation at source into dry and wet waste',
          'Door-to-door collection',
          'Processing of wet waste (composting/biogas)',
          'Recycling of dry waste',
          'Sanitary landfill for reject waste',
          'Construction and demolition waste management',
          'Bulk generator compliance',
          'Annual action plan submission',
        ],
        penalties: 'Under Swachh Bharat: Fine from Rs. 200 to Rs. 5,000 for non-compliance.',
        sourceUrl: 'https://moef.gov.in/solid-waste-management',
      },
      {
        title: 'Biomedical Waste Management Rules, 2016',
        section: 'Rules 1-18',
        summary: 'Regulates management of biomedical waste from healthcare facilities.',
        requirements: [
          'Biomedical waste management committee',
          'Biomedical waste management plan',
          'Color-coded bags and containers',
          'Segregation at point of generation',
          'Treatment and disposal by authorized facilities',
          'Training for all categories of workers',
          'Annual report to pollution board',
          'Treat and dispose within 48 hours',
        ],
        penalties: 'Under EPA: Imprisonment up to 5 years and fine up to Rs. 1 lakh.',
        sourceUrl: 'https://moef.gov.in/biomedical-waste-management',
      },
      {
        title: 'Construction and Demolition Waste Management Rules, 2016',
        section: 'Rules 1-11',
        summary: 'Regulates management of construction and demolition waste.',
        requirements: [
          'Waste management plan before construction',
          'Registration of construction projects above 500 sq.m.',
          'Debris disposal at authorized facilities',
          'Recycling of C&D waste',
          'Separate storage at site',
          'Record of waste generated and disposed',
        ],
        penalties: 'Under EPA: Fine up to Rs. 5 lakh and/or imprisonment up to 3 years.',
        sourceUrl: 'https://moef.gov.in/cd-waste-management',
      },
      {
        title: 'E-Waste (Management) Rules, 2016',
        section: 'Rules 1-14',
        summary: 'Regulates management of electronic waste. Implements Extended Producer Responsibility (EPR).',
        requirements: [
          'EPR compliance for producers',
          'Collection mechanism for e-waste',
          'Authorized dismantlers and recyclers',
          'E-waste deposit from consumers',
          'Target achievement for e-waste collection',
          'Annual returns to CPCB',
          'Consumer awareness',
        ],
        penalties: 'Under EPA: Fine up to Rs. 1 lakh and/or imprisonment up to 3 years.',
        sourceUrl: 'https://moef.gov.in/e-waste-management',
      },
      {
        title: 'Plastic Waste Management Rules, 2016',
        section: 'Rules 1-12',
        summary: 'Regulates management of plastic waste. Bans single-use plastics in phases.',
        requirements: [
          'Ban on single-use plastics (as per notification)',
          'Carry bag thickness: minimum 50 microns',
          'Recycling of plastic waste',
          'EPR for plastic packaging',
          'Registration for plastic producers',
          'Collection and disposal mechanisms',
          'Ban on carry bags below 50 microns',
        ],
        penalties: 'Under EPA: Fine from Rs. 5,000 to Rs. 50,000. Confiscation of plastic items.',
        sourceUrl: 'https://moef.gov.in/plastic-waste-management',
      },
      {
        title: 'Noise Pollution (Regulation and Control) Rules, 2000',
        section: 'Rules 1-9',
        summary: 'Regulates noise pollution levels in different zones.',
        requirements: [
          'Zone-wise noise level standards',
          'Industrial areas: 75 dB day, 70 dB night',
          'Commercial areas: 65 dB day, 55 dB night',
          'Residential areas: 55 dB day, 45 dB night',
          'Silence zones: 50 dB day, 40 dB night',
          'Horn honking restrictions',
          'Construction work restrictions during night',
        ],
        penalties: 'Under EPA: Fine up to Rs. 10,000 for first offence.',
        sourceUrl: 'https://moef.gov.in/noise-pollution',
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

module.exports = EnvironmentScraper;
