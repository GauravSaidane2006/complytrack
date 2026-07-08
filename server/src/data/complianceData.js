const COMPLIANCE_DATA = {
  common: [
    { id: 'GST_REG', title: 'GST Registration', law: 'GST Act', category: 'registration', frequency: 'one-time', priority: 'critical', description: 'Register under GST if turnover exceeds threshold (₹40L goods / ₹20L services)' },
    { id: 'GST_GSTR1', title: 'GSTR-1 Filing (Outward Supplies)', law: 'GST Act', category: 'filing', frequency: 'monthly', priority: 'high', description: 'File monthly/quarterly return of outward supplies by 11th of next month' },
    { id: 'GST_GSTR3B', title: 'GSTR-3B Summary Return', law: 'GST Act', category: 'filing', frequency: 'monthly', priority: 'high', description: 'File monthly summary return by 20th of next month' },
    { id: 'GST_ANNUAL', title: 'GST Annual Return (GSTR-9)', law: 'GST Act', category: 'filing', frequency: 'yearly', priority: 'medium', description: 'File annual return by 31st December of following FY' },
    { id: 'GST_EWAY', title: 'E-Way Bill Compliance', law: 'GST Act', category: 'other', frequency: 'event-based', priority: 'medium', description: 'Generate E-Way bill for goods movement exceeding ₹50,000' },
    { id: 'IT_RET', title: 'Income Tax Return (ITR-6)', law: 'Income Tax Act', category: 'filing', frequency: 'yearly', priority: 'high', description: 'File corporate ITR by 31st October of AY' },
    { id: 'IT_ADVANCE', title: 'Advance Tax Payment', law: 'Income Tax Act', category: 'payment', frequency: 'quarterly', priority: 'high', description: 'Pay advance tax: 15% by Jun, 45% by Sep, 75% by Dec, 100% by Mar' },
    { id: 'TDS_SALARY', title: 'TDS on Salary (Sec 192)', law: 'Income Tax Act', category: 'payment', frequency: 'monthly', priority: 'high', description: 'Deduct TDS on salary and deposit by 7th of next month' },
    { id: 'TDS_CONTRACTOR', title: 'TDS on Contractor (Sec 194C)', law: 'Income Tax Act', category: 'payment', frequency: 'monthly', priority: 'medium', description: 'Deduct TDS on contractor payments and deposit monthly' },
    { id: 'TDS_PROFESSIONAL', title: 'TDS on Professional Fees (Sec 194J)', law: 'Income Tax Act', category: 'payment', frequency: 'monthly', priority: 'medium', description: 'Deduct TDS on professional/technical fees' },
    { id: 'TDS_RETURN', title: 'TDS Quarterly Return (Form 24Q/26Q)', law: 'Income Tax Act', category: 'filing', frequency: 'quarterly', priority: 'high', description: 'File TDS returns quarterly by 31st of following month' },
    { id: 'PF_REG', title: 'EPF Registration', law: 'PF Act', category: 'registration', frequency: 'one-time', priority: 'high', description: 'Register for EPF if 20+ employees' },
    { id: 'PF_MONTHLY', title: 'EPF Monthly Contribution', law: 'PF Act', category: 'payment', frequency: 'monthly', priority: 'high', description: 'Deposit 12% employer + employee contribution by 15th of next month' },
    { id: 'PF_RETURN', title: 'EPF Annual Return (Form 5A)', law: 'PF Act', category: 'filing', frequency: 'yearly', priority: 'medium', description: 'File annual EPF return by 30th November' },
    { id: 'ESI_REG', title: 'ESI Registration', law: 'ESI Act', category: 'registration', frequency: 'one-time', priority: 'high', description: 'Register for ESI if 10+ employees with wages <₹21,000/month' },
    { id: 'ESI_MONTHLY', title: 'ESI Monthly Contribution', law: 'ESI Act', category: 'payment', frequency: 'monthly', priority: 'high', description: 'Deposit 3.25% employer + 0.75% employee contribution by 15th of next month' },
    { id: 'PT', title: 'Professional Tax', law: 'Professional Tax', category: 'payment', frequency: 'monthly', priority: 'medium', description: 'Deduct and pay professional tax as per state slab' },
    { id: 'SHOP_ACT', title: 'Shop & Establishment License', law: 'Shop & Establishment Act', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain/renew shop license under state Shops & Establishments Act' },
    { id: 'COMPANY_RET', title: 'Annual Return (MGT-7)', law: 'Companies Act', category: 'filing', frequency: 'yearly', priority: 'high', description: 'File annual return within 60 days of AGM' },
    { id: 'COMPANY_FIN', title: 'Financial Statements (AOC-4)', law: 'Companies Act', category: 'filing', frequency: 'yearly', priority: 'high', description: 'File financial statements within 30 days of AGM' },
    { id: 'BOARD_MEET', title: 'Board Meetings (Min 4/year)', law: 'Companies Act', category: 'other', frequency: 'quarterly', priority: 'medium', description: 'Hold minimum 4 board meetings per year (gap <120 days)' },
    { id: 'POSH', title: 'POSH Compliance', law: 'Labour Laws', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Constitute Internal Complaints Committee under Sexual Harassment Act' },
    { id: 'BONUS', title: 'Payment of Bonus', law: 'Labour Laws', category: 'payment', frequency: 'yearly', priority: 'medium', description: 'Pay bonus between 8.33% to 20% of wages' },
    { id: 'GRATUITY', title: 'Gratuity Compliance', law: 'Labour Laws', category: 'other', frequency: 'event-based', priority: 'medium', description: 'Pay gratuity after 5 years continuous service (Payment of Gratuity Act)' },
    { id: 'ENV_CTE', title: 'Pollution Board Consent (CTE/CTO)', law: 'Environment Act', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain Consent to Establish and Operate from SPCB' },
  ],

  service: {
    'Information Technology (IT)': [
      { id: 'IT_DATA_PRIVACY', title: 'Data Privacy Compliance (DPDP Act)', law: 'Other', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Comply with Digital Personal Data Protection Act, 2023' },
      { id: 'IT_IT_ACT', title: 'IT Act Compliance (Section 43A)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Implement reasonable security practices for sensitive personal data' },
      { id: 'IT_SOFTWARE', title: 'STPI/Software Export Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'low', description: 'Comply with STPI guidelines if into software exports' },
    ],
    'IT-ITeS / BPO / KPO': [
      { id: 'IT_DATA_PRIVACY', title: 'Data Privacy Compliance (DPDP Act)', law: 'Other', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Comply with Digital Personal Data Protection Act, 2023' },
      { id: 'IT_BPO', title: 'BPO/KPO Regulatory Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with DoT guidelines for BPO operations' },
    ],
    'Telecom': [
      { id: 'TEL_LICENSE', title: 'Telecom License Compliance', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Maintain telecom license as per DoT guidelines' },
      { id: 'TEL_SPECTRUM', title: 'Spectrum Usage Charges', law: 'Other', category: 'payment', frequency: 'quarterly', priority: 'high', description: 'Pay spectrum usage charges quarterly' },
    ],
    'Consulting & Advisory': [],
    'Digital Marketing & Media': [
      { id: 'DM_IT_ACT', title: 'IT Act (Intermediary Guidelines)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with IT Intermediary Guidelines for digital platforms' },
    ],
    'Financial Services & FinTech': [
      { id: 'FIN_RBI', title: 'RBI Compliance (if applicable)', law: 'RBI Act', category: 'registration', frequency: 'yearly', priority: 'critical', description: 'Comply with RBI regulations for financial services' },
      { id: 'FIN_KYC', title: 'KYC/AML Compliance', law: 'RBI Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Implement KYC and Anti-Money Laundering procedures' },
    ],
    'Banking & Insurance': [
      { id: 'BANK_RBI', title: 'RBI/Banking Regulations', law: 'RBI Act', category: 'other', frequency: 'yearly', priority: 'critical', description: 'Comply with RBI banking regulations' },
      { id: 'BANK_IRDAI', title: 'IRDAI Compliance (Insurance)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'critical', description: 'Comply with IRDAI regulations for insurance operations' },
    ],
    'Healthcare Services': [
      { id: 'HEALTH_NABH', title: 'NABH/NABL Accreditation', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain/maintain NABH accreditation for hospitals' },
      { id: 'HEALTH_CLINICAL', title: 'Clinical Establishments Act', law: 'Other', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Register under Clinical Establishments Act' },
    ],
    'Education & EdTech': [
      { id: 'EDU_UGC', title: 'UGC/Regulatory Compliance', law: 'Other', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Comply with UGC/AICTE/other education regulatory body norms' },
    ],
    'Hospitality & Tourism': [
      { id: 'HOTEL_FSSAI', title: 'FSSAI License (Food Service)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain FSSAI license for food service operations' },
      { id: 'HOTEL_TOURISM', title: 'Hotel Registration (Tourism Dept)', law: 'Other', category: 'registration', frequency: 'yearly', priority: 'medium', description: 'Register with state tourism department' },
    ],
    'Logistics & Supply Chain': [
      { id: 'LOG_GST', title: 'GST E-Way Bill Compliance', law: 'GST Act', category: 'other', frequency: 'event-based', priority: 'high', description: 'Generate E-Way bills for goods movement' },
      { id: 'LOG_MOTOR', title: 'Motor Vehicle Act Compliance', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Comply with Motor Vehicle Act for fleet operations' },
    ],
    'Real Estate & Construction': [
      { id: 'RE_RERA', title: 'RERA Registration', law: 'Other', category: 'registration', frequency: 'one-time', priority: 'critical', description: 'Register project under Real Estate Regulation Act' },
      { id: 'RE_BOCW', title: 'Building Workers Cess', law: 'Labour Laws', category: 'payment', frequency: 'yearly', priority: 'medium', description: 'Pay building and other construction workers cess' },
    ],
    'Legal & Accounting Services': [
      { id: 'LEGAL_BAR', title: 'Bar Council Compliance', law: 'Other', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Maintain Bar Council registration for advocates' },
    ],
    'Architecture & Interior Design': [],
    'Advertising & PR': [
      { id: 'AD_ASCI', title: 'ASCI Code Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Advertising Standards Council of India code' },
    ],
    'Transportation & Courier': [
      { id: 'TRANS_PERMIT', title: 'Transport Permit (Motor Vehicle Act)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain/maintain commercial transport permits' },
    ],
    'Other Service': [],
  },

  manufacturing: {
    'Automobile & Auto Components': [
      { id: 'AUTO_AIS', title: 'AIS/CMVR Type Approval', law: 'Other', category: 'licence', frequency: 'one-time', priority: 'critical', description: 'Obtain type approval from ICAT/ARAI/CIRT under CMVR' },
      { id: 'AUTO_IATF', title: 'IATF 16949 Certification', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Maintain IATF 16949 quality management system certification' },
      { id: 'AUTO_ENV', title: 'ELV Directive Compliance', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with End-of-Life Vehicle recycling norms' },
      { id: 'AUTO_PESO', title: 'PESO Approval (Fuel Systems)', law: 'Other', category: 'licence', frequency: 'one-time', priority: 'high', description: 'Obtain PESO approval for fuel tanks and pressure vessels' },
    ],
    'Pharmaceuticals & Medical Devices': [
      { id: 'PHARMA_MFG', title: 'Drug Manufacturing License (Form 25)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain manufacturing license from CDSCO for drug production' },
      { id: 'PHARMA_GMP', title: 'Schedule M / WHO-GMP Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'critical', description: 'Comply with GMP standards for pharmaceutical manufacturing' },
      { id: 'PHARMA_CDSCO', title: 'CDSCO Annual Return', law: 'Other', category: 'filing', frequency: 'yearly', priority: 'high', description: 'File annual drug production report to CDSCO' },
      { id: 'PHARMA_DEV', title: 'Medical Device Registration', law: 'Other', category: 'registration', frequency: 'one-time', priority: 'high', description: 'Register medical devices with CDSCO (Class A/B/C/D)' },
      { id: 'PHARMA_ENV', title: 'Pharma Effluent Treatment', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Treat pharmaceutical effluents as per CPCB standards' },
    ],
    'Textiles & Garments': [
      { id: 'TEXT_FIRE', title: 'Fire Safety NOC', law: 'Factory Act', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain fire NOC from fire department for garment factories' },
      { id: 'TEXT_ETP', title: 'Effluent Treatment Plant (ETP)', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Operate ETP for dyeing/wet processing units' },
      { id: 'TEXT_LABOUR', title: 'Contract Labour Compliance', law: 'Labour Laws', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Comply with Contract Labour Act for garment manufacturing' },
      { id: 'TEXT_SOCIAL', title: 'Social Compliance Audit', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Conduct SA8000/SEDEX/WRAP social audit' },
    ],
    'Food & Beverage Processing': [
      { id: 'FOOD_FSSAI', title: 'FSSAI Central/State License', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain FSSAI license for food processing operations' },
      { id: 'FOOD_HACCP', title: 'HACCP/ISO 22000 Certification', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain food safety management certification' },
      { id: 'FOOD_BIS', title: 'BIS Standards for Food Products', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with BIS standards for packaged food products' },
      { id: 'FOOD_LABEL', title: 'FSSAI Labelling Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with labelling regulations including nutritional info' },
    ],
    'Chemicals & Petrochemicals': [
      { id: 'CHEM_PESO', title: 'PESO License (Petroleum/Explosives)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain PESO license for petroleum/explosive handling' },
      { id: 'CHEM_HAZMAT', title: 'MSIHC Rules Compliance', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'critical', description: 'Comply with Manufacture Storage & Import of Hazardous Chemical Rules' },
      { id: 'CHEM_EIA', title: 'Environmental Impact Assessment', law: 'Environment Act', category: 'other', frequency: 'one-time', priority: 'high', description: 'Obtain EIA clearance for red/orange category industries' },
      { id: 'CHEM_ERP', title: 'Emergency Response Plan', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Prepare and maintain on-site emergency response plan' },
    ],
    'Electronics & IT Hardware': [
      { id: 'ELEC_BIS', title: 'BIS Compulsory Registration', law: 'Other', category: 'registration', frequency: 'one-time', priority: 'critical', description: 'Obtain BIS CRS registration for electronics products' },
      { id: 'ELEC_EMC', title: 'EMC/Safety Testing', law: 'Other', category: 'other', frequency: 'one-time', priority: 'high', description: 'Conduct EMC and safety testing per IS 13252' },
      { id: 'ELEC_EWASTE', title: 'E-Waste Management Rules', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with E-Waste Management Rules and EPR authorization' },
      { id: 'ELEC_ROHS', title: 'RoHS Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Restriction of Hazardous Substances norms' },
    ],
    'Metals, Steel & Foundries': [
      { id: 'STEEL_BIS', title: 'BIS Certification for Steel Products', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain BIS certification for steel products (IS 2062, IS 1079)' },
      { id: 'STEEL_ZLD', title: 'Zero Liquid Discharge (ZLD)', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Implement ZLD for steel plant effluents' },
      { id: 'STEEL_ENERGY', title: 'Energy Audit (PAT Scheme)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Conduct energy audit under PAT scheme for designated consumers' },
    ],
    'Cement & Building Materials': [
      { id: 'CEMENT_EIA', title: 'EIA Clearance (MoEF&CC)', law: 'Environment Act', category: 'other', frequency: 'one-time', priority: 'critical', description: 'Obtain EIA clearance from MoEF&CC for cement plants' },
      { id: 'CEMENT_BIS', title: 'BIS Certification for Cement', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain BIS certification for cement products (IS 269/455/12269)' },
      { id: 'CEMENT_MINE', title: 'Mining Lease & Plan', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Maintain mineral concession and mining plan' },
      { id: 'CEMENT_STACK', title: 'Stack Emission Monitoring', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Continuous monitoring of PM, SO2, NOx, CO emissions' },
    ],
    'Plastics & Rubber': [
      { id: 'PLASTIC_EPR', title: 'EPR Registration (Plastic Waste)', law: 'Environment Act', category: 'registration', frequency: 'yearly', priority: 'critical', description: 'Obtain EPR authorization under Plastic Waste Management Rules' },
      { id: 'PLASTIC_BIS', title: 'BIS for Plastic Products', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'medium', description: 'Obtain BIS certification for plastic packaging/products' },
      { id: 'PLASTIC_THICK', title: 'Carry Bag Thickness (>50 microns)', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Ensure carry bags comply with minimum thickness norms' },
    ],
    'Paper & Printing': [
      { id: 'PAPER_EFF', title: 'Effluent Discharge Compliance', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with CPCB standards for paper mill effluents' },
      { id: 'PAPER_BOILER', title: 'Boiler Consent (CPCB)', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Obtain CPCB consent for boiler operations' },
    ],
    'Engineering & Machinery': [
      { id: 'ENG_BIS', title: 'BIS for Industrial Machinery', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'medium', description: 'Obtain BIS certification for industrial machinery products' },
      { id: 'ENG_CRANE', title: 'Crane/Lifting Equipment Inspection', law: 'Factory Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Annual inspection of cranes and lifting equipment' },
      { id: 'ENG_ISO', title: 'ISO 9001/45001 Certification', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Maintain ISO 9001 and ISO 45001 certifications' },
    ],
    'Defense & Aerospace': [
      { id: 'DEF_LICENSE', title: 'Industrial License (MoCI)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain industrial license from MoCI for defense items' },
      { id: 'DEF_AS9100', title: 'AS9100 Certification', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain/maintain AS9100 aerospace quality certification' },
      { id: 'DEF_EXPORT', title: 'Defense Export License (DGFT)', law: 'Custom Act', category: 'licence', frequency: 'one-time', priority: 'high', description: 'Obtain export license from DGFT for defense items' },
    ],
    'Shipbuilding & Repair': [
      { id: 'SHIP_CLASS', title: 'Classification Society Approval', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain class approval from IRS/DNV/Lloyd\'s/ABS' },
      { id: 'SHIP_MARPOL', title: 'MARPOL Compliance', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with MARPOL marine pollution prevention rules' },
      { id: 'SHIP_SOLAS', title: 'SOLAS Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with Safety of Life at Sea conventions' },
    ],
    'FMCG (Fast Moving Consumer Goods)': [
      { id: 'FMCG_FSSAI', title: 'FSSAI License (if food products)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain FSSAI license for food FMCG products' },
      { id: 'FMCG_BIS', title: 'BIS Standards Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with BIS standards for consumer products' },
    ],
    'Furniture & Wood Products': [
      { id: 'WOOD_FSC', title: 'FSC Certification', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'low', description: 'Obtain Forest Stewardship Council certification' },
      { id: 'WOOD_ENV', title: 'VOC Emission Control', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Control VOC emissions from wood treatment/coating' },
    ],
    'Other Manufacturing': [],
  },

  trading: {
    'Retail (General Store / Kirana)': [
      { id: 'RET_FSSAI', title: 'FSSAI Registration (Food Items)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain FSSAI registration for selling food items' },
      { id: 'RET_WEIGHT', title: 'Weights & Measures Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Legal Metrology Act for weighing instruments' },
      { id: 'RET_MRP', title: 'MRP/Labelling Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Display MRP and comply with packaging labelling rules' },
    ],
    'Grocery & Supermarket': [
      { id: 'GROC_FSSAI', title: 'FSSAI State/Central License', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain FSSAI license for grocery/supermarket operations' },
      { id: 'GROC_WEIGHT', title: 'Weights & Measures Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Legal Metrology Act for weighing instruments' },
      { id: 'GROC_PEST', title: 'Pest Control Records', law: 'Other', category: 'other', frequency: 'yearly', priority: 'low', description: 'Maintain pest control records for food storage areas' },
    ],
    'Electronics & Appliances': [
      { id: 'ELEC_BIS', title: 'BIS Compliance (Sold Products)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Ensure sold electronics carry BIS/CRS marking' },
      { id: 'ELEC_WARRANTY', title: 'Consumer Protection (Warranty)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Consumer Protection Act warranty norms' },
      { id: 'ELEC_EWASTE', title: 'E-Waste Collection Responsibility', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with e-waste collection under EPR framework' },
    ],
    'Clothing & Footwear': [
      { id: 'CLOTH_FSSAI', title: 'FSSAI (if selling food items)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'low', description: 'Obtain FSSAI if selling packaged food alongside clothing' },
      { id: 'CLOTH_BIS', title: 'BIS for Textile Products', law: 'Other', category: 'other', frequency: 'yearly', priority: 'low', description: 'Comply with BIS standards for textile products if applicable' },
    ],
    'Jewellery & Accessories': [
      { id: 'JEWEL_HALL', title: 'Hallmarking Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with BIS hallmarking norms for gold/silver jewellery' },
      { id: 'JEWEL_PAN', title: 'PAN for Sales >₹2L (Sec 206C)', law: 'Income Tax Act', category: 'other', frequency: 'event-based', priority: 'medium', description: 'Collect PAN for cash sales exceeding ₹2 lakh' },
    ],
    'Furniture & Home Décor': [
      { id: 'FURN_BIS', title: 'BIS for Furniture Products', law: 'Other', category: 'other', frequency: 'yearly', priority: 'low', description: 'Comply with BIS standards for furniture if applicable' },
    ],
    'Building Materials & Hardware': [
      { id: 'BMAT_BIS', title: 'BIS for Construction Materials', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Ensure building materials carry BIS certification' },
      { id: 'BMAT_WEIGHT', title: 'Weights & Measures Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Legal Metrology Act for measuring instruments' },
    ],
    'Pharmacy & Medical Store': [
      { id: 'PHARMA_DRUG', title: 'Drug License (Retail)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain retail drug license from State Drug Controller' },
      { id: 'PHARMA_GDP', title: 'Good Distribution Practices', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with GDP for storage and distribution of medicines' },
      { id: 'PHARMA_SCHEDULE', title: 'Schedule H/H1 Drug Records', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Maintain records for Schedule H and H1 drug sales' },
    ],
    'Stationery & Office Supplies': [],
    'Auto Parts & Accessories': [
      { id: 'AUTO_BIS', title: 'BIS for Auto Components', law: 'Other', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Ensure auto parts carry BIS certification where required' },
    ],
    'Wholesale / Distribution': [
      { id: 'WHOLE_GST', title: 'GST Compliance (B2B)', law: 'GST Act', category: 'filing', frequency: 'monthly', priority: 'high', description: 'File GST returns for B2B transactions and maintain invoices' },
      { id: 'WHOLE_TCS', title: 'TCS Collection (Sec 206C)', law: 'Income Tax Act', category: 'payment', frequency: 'monthly', priority: 'medium', description: 'Collect TCS on goods sale exceeding ₹50 lakh' },
    ],
    'E-Commerce & Online Trading': [
      { id: 'ECOM_IT', title: 'IT Act (Intermediary Guidelines)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with IT Intermediary Guidelines for e-commerce platforms' },
      { id: 'ECOM_CONSUMER', title: 'Consumer Protection (E-Commerce Rules)', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with Consumer Protection (E-Commerce) Rules, 2020' },
      { id: 'ECOM_GST', title: 'TCS Under GST (Sec 52)', law: 'GST Act', category: 'payment', frequency: 'monthly', priority: 'high', description: 'Deduct 1% TCS under GST for e-commerce operators' },
    ],
    'Import & Export Trading': [
      { id: 'IEC', title: 'IEC (Importer Exporter Code)', law: 'Custom Act', category: 'registration', frequency: 'one-time', priority: 'critical', description: 'Obtain IEC from DGFT for import/export operations' },
      { id: 'CUSTOM_DUTY', title: 'Customs Duty Payment & Filing', law: 'Custom Act', category: 'payment', frequency: 'event-based', priority: 'high', description: 'Pay customs duty and file bills of entry/shipping bills' },
      { id: 'BIS_IMPORT', title: 'BIS for Imported Goods', law: 'Other', category: 'other', frequency: 'one-time', priority: 'high', description: 'Ensure imported goods meet BIS standards where applicable' },
    ],
    'Agricultural Inputs (Seeds, Fertilizers)': [
      { id: 'AGRI_FSSAI', title: 'FSSAI License (if food items)', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain FSSAI license if selling food-grade agricultural products' },
      { id: 'AGRI_PESTICIDE', title: 'Insecticides Act Compliance', law: 'Other', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with Insecticides Act for pesticide/fertilizer sales' },
    ],
    'Petroleum & Fuel Dealers': [
      { id: 'PETRO_PESO', title: 'PESO License', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain PESO license for petroleum product storage/sales' },
      { id: 'PETRO_Pollution', title: 'Pollution Control Compliance', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with pollution control norms for fuel stations' },
    ],
    'Other Trading / Retail': [],
  },

  commonIndustries: {
    manufacturing: [
      { id: 'FAC_LICENSE', title: 'Factory License', law: 'Factory Act', category: 'licence', frequency: 'yearly', priority: 'critical', description: 'Obtain Factory License under Factories Act, 1948' },
      { id: 'FAC_PLAN', title: 'Building Plan Approval', law: 'Factory Act', category: 'other', frequency: 'one-time', priority: 'high', description: 'Get building plan approved by Chief Inspector of Factories' },
      { id: 'FAC_SAFETY', title: 'Safety Officer Appointment', law: 'Factory Act', category: 'registration', frequency: 'yearly', priority: 'high', description: 'Appoint Safety Officer if 500+ workers (Factories Act)' },
      { id: 'FAC_ANNUAL', title: 'Annual Return to Inspector of Factories', law: 'Factory Act', category: 'filing', frequency: 'yearly', priority: 'high', description: 'File annual return to Inspector of Factories' },
      { id: 'FAC_ACCIDENT', title: 'Accident Reporting', law: 'Factory Act', category: 'other', frequency: 'event-based', priority: 'critical', description: 'Report accidents within 12 hours (fatal) / 24 hours (serious)' },
      { id: 'ENV_AIR', title: 'Air Pollution Control', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with Air Act emission limits for stacks' },
      { id: 'ENV_WATER', title: 'Water Pollution Control', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with Water Act effluent discharge standards' },
      { id: 'ENV_HAZ', title: 'Hazardous Waste Management', law: 'Environment Act', category: 'other', frequency: 'yearly', priority: 'high', description: 'Comply with Hazardous Waste Management Rules' },
      { id: 'LABOUR_BOCW', title: 'Building Workers Welfare Cess', law: 'Labour Laws', category: 'payment', frequency: 'yearly', priority: 'medium', description: 'Pay 1-2% cess on construction cost under BOCW Act' },
      { id: 'LABOUR_MIGRANT', title: 'Inter-State Migrant Workmen Act', law: 'Labour Laws', category: 'other', frequency: 'yearly', priority: 'medium', description: 'Comply with Inter-State Migrant Workmen Act if applicable' },
      { id: 'LABOUR_CHILD', title: 'Child Labour Prohibition', law: 'Labour Laws', category: 'other', frequency: 'yearly', priority: 'critical', description: 'Strict compliance with Child Labour Prohibition Act' },
    ],
    service: [],
    trading: [
      { id: 'TRADE_LICENSE', title: 'Municipal Trade License', law: 'Shop & Establishment Act', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain/renew municipal trade license' },
      { id: 'TRADE_FIRE', title: 'Fire Safety NOC', law: 'Other', category: 'licence', frequency: 'yearly', priority: 'high', description: 'Obtain fire safety NOC from fire department' },
    ],
  }
};

module.exports = COMPLIANCE_DATA;
