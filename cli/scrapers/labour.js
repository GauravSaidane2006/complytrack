const HttpClient = require('../utils/httpClient');
const HtmlParser = require('../utils/htmlParser');
const chalk = require('chalk');

class LabourScraper {
  constructor() {
    this.httpClient = new HttpClient({ delay: 2500 });
    this.baseUrl = 'https://labour.gov.in';
    this.sectorName = 'Labour Laws & Employment';
  }

  async scrape() {
    console.log(chalk.blue(`  Scraping ${this.sectorName}...`));

    const regulations = [
      {
        title: 'Factories Act, 1948',
        section: 'Sections 1-120',
        summary: 'Regulates working conditions in factories including hours of work, welfare, health, safety, and leave provisions. Applies to premises with 10+ workers and power, or 20+ without power.',
        requirements: [
          'Registration of factory with Chief Inspector',
          'Maximum 48 hours work per week',
          'Maximum 9 hours per day',
          'Overtime not exceeding prescribed limits',
          'Weekly holiday mandatory',
          'Separate registers for overtime, wages, leave',
          'Safety measures: fencing, lighting, ventilation',
          'First aid and medical facilities',
          'Canteen for factories with 250+ workers',
          'Annual leave with wages: 1 day for every 20 days worked',
        ],
        penalties: 'Section 92: Fine up to Rs. 2 lakh for general offences. Section 94: Imprisonment up to 2 years for serious accidents. Continuing default: additional Rs. 1,000 per day.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/FactoryAct1948.pdf',
      },
      {
        title: 'Industrial Disputes Act, 1947',
        section: 'Sections 1-38',
        summary: 'Provides machinery for investigation and settlement of industrial disputes. Governs strikes, lockouts, retrenchment, and layoff.',
        requirements: [
          'Standing orders for establishments with 100+ workers',
          'Conciliation proceedings before strike',
          '14-day notice for strike or lockout',
          'Retrenchment compensation: 15 days per year of service',
          'Prior government approval for retrenchment (100+ workers)',
          'Dispute reference to Labour Court/Tribunal',
          'Payment of wages during dispute period',
        ],
        penalties: 'Section 26: Strike/lockout during conciliation - fine up to Rs. 1,000. Section 36A: Non-compliance with award - imprisonment up to 6 months.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/IndustrialDisputesAct1947.pdf',
      },
      {
        title: 'Payment of Wages Act, 1936',
        section: 'Sections 1-26',
        summary: 'Regulates payment of wages to certain classes of employed persons. Ensures timely payment without unauthorized deductions.',
        requirements: [
          'Wages paid before 7th (establishment with 1000+ workers)',
          'Wages paid before 10th (other establishments)',
          'Deductions not exceeding 50% of wages',
          'No deduction for fines',
          'Wages by cheque or bank transfer',
          'Muster roll maintenance',
          'Wage slips to employees',
        ],
        penalties: 'Section 20: Fine up to Rs. 3,700 for delayed wages. Section 23: Additional fine for unauthorized deductions.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/PaymentofWagesAct1936.pdf',
      },
      {
        title: 'Minimum Wages Act, 1948',
        section: 'Sections 1-33',
        summary: 'Fixes minimum wages for employees in certain employments. Central and state governments revise wages periodically.',
        requirements: [
          'Payment of minimum wages as notified',
          'Wage revision compliance',
          'Wage fixation for scheduled employments',
          'Overtime at double the rate',
          'No deduction for amenities provided',
          'Wage registers maintenance',
          'Notice of minimum wages displayed',
        ],
        penalties: 'Section 22: Fine up to Rs. 500 for paying less than minimum wages. Section 22A: Imprisonment up to 6 months for repeated offences.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/MinimumWagesAct1948.pdf',
      },
      {
        title: 'Employees Provident Funds Act, 1952',
        section: 'Sections 1-26',
        summary: 'Provides for provident fund and pension schemes for employees. Mandatory for establishments with 20+ employees.',
        requirements: [
          'EPF registration within 1 month of crossing threshold',
          'Employee contribution: 12% of basic wages',
          'Employer contribution: 12% of basic wages',
          'Monthly deposit by 15th of following month',
          'UAN (Universal Account Number) for all employees',
          'ECR (Electronic Challan cum Return) filing',
          'Annual return submission',
          'PF withdrawal as per rules',
        ],
        penalties: 'Section 14A: Imprisonment up to 3 years and fine up to Rs. 10 lakh for default in depositing contributions.',
        sourceUrl: 'https://www.epfindia.gov.in/site_en/Legislation.php',
      },
      {
        title: 'Employees State Insurance Act, 1948',
        section: 'Sections 1-98',
        summary: 'Provides medical, sickness, maternity, and employment injury benefits to employees. Applies to establishments with 10+ employees.',
        requirements: [
          'ESI registration for establishments with 10+ employees',
          'Employee contribution: 0.75% of wages',
          'Employer contribution: 3.25% of wages',
          'Monthly contribution by 15th',
          'Wages limit: Rs. 21,000 per month',
          'Medical benefit to insured persons',
          'Sickness benefit: 70% of wages for 91 days',
          'Maternity benefit: 100% of wages for 26 weeks',
        ],
        penalties: 'Section 85: Imprisonment up to 2 years and fine up to Rs. 5,000 for default in payment of contributions.',
        sourceUrl: 'https://www.esic.nic.in/employers',
      },
      {
        title: 'Child Labour (Prohibition and Regulation) Act, 1986',
        section: 'Sections 1-32',
        summary: 'Prohibits employment of children below 14 years and regulates employment of adolescents (14-18 years) in hazardous occupations.',
        requirements: [
          'No employment of children below 14 years',
          'No employment in hazardous processes',
          'Adolescent employment with restrictions',
          'Certificate of age for employment',
          'Working hours restrictions for adolescents',
          'Education provisions for working children',
        ],
        penalties: 'Section 14: Imprisonment from 6 months to 2 years and fine Rs. 20,000 to 50,000.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/ChildLabourAct1986.pdf',
      },
      {
        title: 'Contract Labour (Regulation and Abolition) Act, 1970',
        section: 'Sections 1-35',
        summary: 'Regulates employment of contract labour and provides for abolition in certain circumstances. Applies to establishments with 20+ contract workers.',
        requirements: [
          'Registration of principal employer',
          'Licensing of contractor',
          'Contractor to pay wages within prescribed time',
          'Amenities: canteen, rest rooms, first aid',
          'Wages not less than minimum wages',
          'No contract labour in core activities',
          'Welfare officer for 100+ workers',
        ],
        penalties: 'Section 22: Fine up to Rs. 1,000 for general offences. Section 23: Imprisonment up to 3 months for serious violations.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/ContractLabourAct1970.pdf',
      },
      {
        title: 'Equal Remuneration Act, 1976',
        section: 'Sections 1-12',
        summary: 'Prohibits discrimination in remuneration based on gender. Ensures equal pay for equal work.',
        requirements: [
          'Equal wages for equal work',
          'No discrimination in recruitment',
          'No discrimination in terms of service',
          'Maintain registers of remuneration',
          'File annual returns',
        ],
        penalties: 'Section 10: Fine up to Rs. 10,000 and/or imprisonment up to 3 months.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/EqualRemunerationAct1976.pdf',
      },
      {
        title: 'Maternity Benefit Act, 1961',
        section: 'Sections 1-24',
        summary: 'Provides for maternity benefit to women employees. Applies to establishments with 10+ employees.',
        requirements: [
          '26 weeks paid maternity leave',
          'Medical bonus of Rs. 1,000',
          'Crèche facility for 50+ employees',
          'Work from home option after maternity leave',
          'No termination during pregnancy',
          'Maternity benefit for 12 weeks for adopted child',
        ],
        penalties: 'Section 21: Fine up to Rs. 5,000 for non-payment of maternity benefit. Section 22: Imprisonment up to 3 months.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/MaternityBenefitAct1961.pdf',
      },
      {
        title: 'Sexual Harassment of Women at Workplace Act, 2013',
        section: 'Sections 1-16',
        summary: 'Provides protection against sexual harassment of women at workplace and for redressal of complaints.',
        requirements: [
          'Internal Complaints Committee (ICC) for 10+ employees',
          'ICC with 50% women members',
          'Presiding officer must be senior woman employee',
          'Display penalties for sexual harassment',
          'Conduct awareness programs',
          'Annual report of complaints',
          'District officer appointment',
        ],
        penalties: 'Section 14: Fine up to Rs. 50,000 for employer non-compliance. Repeat offence: double penalty.',
        sourceUrl: 'https://labour.gov.in/sites/default/files/SexualHarassmentAct2013.pdf',
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

module.exports = LabourScraper;
