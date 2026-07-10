const QUESTIONS = {
  common: [
    {
      id: 'turnover',
      question: 'What is your company\'s approximate annual turnover?',
      type: 'select',
      required: true,
      options: [
        { value: 'below_20L', label: 'Below Rs. 20 Lakhs' },
        { value: '20L_40L', label: 'Rs. 20 Lakhs - Rs. 40 Lakhs' },
        { value: '40L_1_5Cr', label: 'Rs. 40 Lakhs - Rs. 1.5 Crores' },
        { value: '1_5Cr_5Cr', label: 'Rs. 1.5 Crores - Rs. 5 Crores' },
        { value: 'above_5Cr', label: 'Above Rs. 5 Crores' }
      ],
      impact: {
        'below_20L': { gst: 'optional', audit: 'not_applicable', professionalTax: 'depends_on_state' },
        '20L_40L': { gst: 'recommended', audit: 'not_applicable', professionalTax: 'mandatory' },
        '40L_1_5Cr': { gst: 'mandatory', audit: 'recommended', professionalTax: 'mandatory' },
        '1_5Cr_5Cr': { gst: 'mandatory', audit: 'mandatory', professionalTax: 'mandatory' },
        'above_5Cr': { gst: 'mandatory', audit: 'mandatory', professionalTax: 'mandatory' }
      }
    },
    {
      id: 'employees',
      question: 'How many employees does your company have?',
      type: 'select',
      required: true,
      options: [
        { value: '1_10', label: '1 - 10' },
        { value: '11_20', label: '11 - 20' },
        { value: '21_50', label: '21 - 50' },
        { value: '51_200', label: '51 - 200' },
        { value: 'above_200', label: 'Above 200' }
      ],
      impact: {
        '1_10': { pf: 'not_applicable', esi: 'not_applicable', posh: 'recommended', factoryLicense: 'not_applicable' },
        '11_20': { pf: 'not_applicable', esi: 'not_applicable', posh: 'recommended', factoryLicense: 'not_applicable' },
        '21_50': { pf: 'mandatory', esi: 'mandatory', posh: 'mandatory', factoryLicense: 'depends_on_activity' },
        '51_200': { pf: 'mandatory', esi: 'mandatory', posh: 'mandatory', factoryLicense: 'mandatory_if_manufacturing' },
        'above_200': { pf: 'mandatory', esi: 'mandatory', posh: 'mandatory', factoryLicense: 'mandatory_if_manufacturing' }
      }
    },
    {
      id: 'companyType',
      question: 'What is your company type?',
      type: 'select',
      required: true,
      options: [
        { value: 'private_limited', label: 'Private Limited' },
        { value: 'public_limited', label: 'Public Limited' },
        { value: 'one_person', label: 'One Person Company (OPC)' },
        { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
        { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
        { value: 'partnership', label: 'Partnership Firm' },
        { value: 'huf', label: 'Hindu Undivided Family (HUF)' },
        { value: 'society', label: 'Society / Trust / NGO' }
      ],
      impact: {
        'private_limited': { companiesAct: 'mandatory', rocFilings: 'mandatory', annualReturn: 'mandatory' },
        'public_limited': { companiesAct: 'mandatory', rocFilings: 'mandatory', annualReturn: 'mandatory' },
        'one_person': { companiesAct: 'mandatory', rocFilings: 'mandatory', annualReturn: 'mandatory' },
        'llp': { companiesAct: 'mandatory', rocFilings: 'mandatory', annualReturn: 'mandatory' },
        'sole_proprietorship': { companiesAct: 'not_applicable', rocFilings: 'not_applicable', annualReturn: 'not_applicable' },
        'partnership': { companiesAct: 'not_applicable', rocFilings: 'not_applicable', annualReturn: 'not_applicable' },
        'huf': { companiesAct: 'not_applicable', rocFilings: 'not_applicable', annualReturn: 'not_applicable' },
        'society': { companiesAct: 'not_applicable', rocFilings: 'not_applicable', annualReturn: 'not_applicable' }
      }
    },
    {
      id: 'hasPhysicalOffice',
      question: 'Does your company have a physical office, shop, or commercial establishment?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No (Home-based / Virtual office)' }
      ],
      impact: {
        'yes': { shopEstablishment: 'mandatory', fireNoc: 'recommended', municipalTradeLicense: 'mandatory' },
        'no': { shopEstablishment: 'not_applicable', fireNoc: 'not_applicable', municipalTradeLicense: 'not_applicable' }
      }
    },
    {
      id: 'importsExports',
      question: 'Does your company import or export goods/services?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      impact: {
        'yes': { customAct: 'mandatory', dgft: 'mandatory', iec: 'mandatory' },
        'no': { customAct: 'not_applicable', dgft: 'not_applicable', iec: 'not_applicable' }
      }
    }
  ],
  service: [
    {
      id: 'handlesPersonalData',
      question: 'Does your company collect, store, or process personal data of customers/employees?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      impact: {
        'yes': { dpdp: 'mandatory' },
        'no': { dpdp: 'not_applicable' }
      }
    },
    {
      id: 'providesFinancialServices',
      question: 'Does your company provide financial, banking, or insurance services?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      impact: {
        'yes': { rbiAct: 'mandatory', sebi: 'mandatory', fema: 'mandatory' },
        'no': { rbiAct: 'not_applicable', sebi: 'not_applicable', fema: 'not_applicable' }
      }
    }
  ],
  manufacturing: [
    {
      id: 'usesHazardousMaterials',
      question: 'Does your manufacturing process use hazardous materials or produce hazardous waste?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'Not sure' }
      ],
      impact: {
        'yes': { hazardousWaste: 'mandatory', pollutionConsent: 'mandatory', factoryLicense: 'mandatory' },
        'no': { hazardousWaste: 'not_applicable', pollutionConsent: 'recommended', factoryLicense: 'depends_on_scale' },
        'unsure': { hazardousWaste: 'recommended', pollutionConsent: 'recommended', factoryLicense: 'recommended' }
      }
    },
    {
      id: 'productionCapacity',
      question: 'What is your production/manufacturing scale?',
      type: 'select',
      required: true,
      options: [
        { value: 'small', label: 'Small (Cottage / Micro unit)' },
        { value: 'medium', label: 'Medium (Small & Medium Enterprise)' },
        { value: 'large', label: 'Large (Major industrial unit)' }
      ],
      impact: {
        'small': { factoryLicense: 'recommended', safetyOfficer: 'not_applicable', annualReturn: 'recommended' },
        'medium': { factoryLicense: 'mandatory', safetyOfficer: 'recommended', annualReturn: 'mandatory' },
        'large': { factoryLicense: 'mandatory', safetyOfficer: 'mandatory', annualReturn: 'mandatory' }
      }
    }
  ],
  trading: [
    {
      id: 'sellsOnline',
      question: 'Does your company sell products online (e-commerce, website, social media)?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No (Physical store only)' }
      ],
      impact: {
        'yes': { consumerProtection: 'mandatory', ecommCompliance: 'mandatory', itAct: 'mandatory' },
        'no': { consumerProtection: 'recommended', ecommCompliance: 'not_applicable', itAct: 'not_applicable' }
      }
    },
    {
      id: 'handlesFoodProducts',
      question: 'Does your company sell food products (including packaged food, beverages, or perishables)?',
      type: 'select',
      required: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      impact: {
        'yes': { fssai: 'mandatory', apmc: 'depends_on_state' },
        'no': { fssai: 'not_applicable', apmc: 'not_applicable' }
      }
    }
  ]
};

const COMPLIANCEIMPACT_MAP = {
  gst: ['GST_REG', 'GST_RET', 'GSTPayment', 'GST_ANNUAL', 'GST_REV'],
  audit: ['STAT_AUDIT', 'TAX_AUDIT'],
  professionalTax: ['PROF_TAX'],
  pf: ['PF_RETURN', 'PF_PAYMENT', 'PF_REGISTRATION'],
  esi: ['ESI_PAYMENT', 'ESI_RETURN'],
  posh: ['POSH_ANNUAL'],
  factoryLicense: ['FACTORY_LICENSE', 'BUILDING_PLAN', 'SAFETY_OFFICER', 'ANNUAL_RETURN_FACTORY', 'ACCIDENT_REPORT', 'AIR_CONSENT', 'WATER_CONSENT', 'HAZARDOUS_WASTE', 'BOCW_CESS'],
  shopEstablishment: ['SHOP_EST'],
  fireNoc: ['FIRE_SAFETY_NOC'],
  municipalTradeLicense: ['MUNICIPAL_TRADE_LICENSE'],
  customAct: ['IMPORT_EXPORT', 'CUSTOM_DUTY'],
  dgft: ['DGFT_IEC'],
  iec: ['DGFT_IEC'],
  companiesAct: ['ROC_ANNUAL_RETURN', 'ROC_BOARD_MEETINGS', 'ROC_financial'],
  rocFilings: ['ROC_ANNUAL_RETURN', 'ROC_BOARD_MEETINGS'],
  annualReturn: ['ROC_ANNUAL_RETURN'],
  dpdp: ['DPDP_REG'],
  rbiAct: ['RBI_COMPLIANCE'],
  sebi: ['SEBI_FILING'],
  fema: ['FEMA_COMPLIANCE'],
  hazardousWaste: ['HAZARDOUS_WASTE'],
  pollutionConsent: ['AIR_CONSENT', 'WATER_CONSENT'],
  safetyOfficer: ['SAFETY_OFFICER'],
  annualReturn: ['ANNUAL_RETURN_FACTORY', 'ROC_ANNUAL_RETURN'],
  consumerProtection: ['CONSUMER_PROTECTION'],
  ecommCompliance: ['ECOM_COMPLIANCE'],
  itAct: ['IT_ACT_COMPLIANCE'],
  fssai: ['FSSAI_LICENSE'],
  apmc: ['APMC_LICENSE']
};

function getMandatoryComplianceIds(sector, answers) {
  const mandatoryIds = new Set();
  const recommendedIds = new Set();

  const allQuestions = [...QUESTIONS.common, ...(QUESTIONS[sector] || [])];

  allQuestions.forEach((q) => {
    const answer = answers[q.id];
    if (!answer || !q.impact[answer]) return;

    const impact = q.impact[answer];
    Object.entries(impact).forEach(([key, level]) => {
      const complianceIds = COMPLIANCEIMPACT_MAP[key] || [];
      if (level === 'mandatory') {
        complianceIds.forEach((id) => mandatoryIds.add(id));
      } else if (level === 'recommended') {
        complianceIds.forEach((id) => {
          if (!mandatoryIds.has(id)) recommendedIds.add(id);
        });
      }
    });
  });

  return { mandatory: [...mandatoryIds], recommended: [...recommendedIds] };
}

function getQuestionnaireBySector(sector) {
  return [...QUESTIONS.common, ...(QUESTIONS[sector] || [])];
}

module.exports = {
  QUESTIONS,
  COMPLIANCEIMPACT_MAP,
  getMandatoryComplianceIds,
  getQuestionnaireBySector
};
