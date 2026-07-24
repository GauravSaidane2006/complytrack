const ONBOARDING_DATA = {
  service: {
    common: [
      {
        type: 'company_registration',
        name: 'Company Registration Certificate',
        shortName: 'Certificate of Incorporation',
        icon: '📄',
        description: 'Certificate of Incorporation issued by the Registrar of Companies (ROC) under the Ministry of Corporate Affairs (MCA). This is the foundational legal document proving your company exists as a separate legal entity.',
        whyNeeded: 'Every company in India must be registered under the Companies Act, 2013. This certificate is required for opening bank accounts, signing contracts, filing taxes, and all official business dealings.',
        portal: { name: 'MCA Portal', url: 'https://www.mca.gov.in' },
        documentsRequired: [
          'Director Aadhaar & PAN cards',
          'Registered office address proof (rent agreement + utility bill)',
          'Memorandum of Association (MOA)',
          'Articles of Association (AOA)',
          'Board Resolution for authorized signatory',
          'Declaration by professionals (DIR-2, INC-8)'
        ],
        process: [
          'Apply for Digital Signature Certificate (DSC) for all directors',
          'Apply for Director Identification Number (DIN) via RUN/SPICe+',
          'Reserve company name via RUN service',
          'File SPICe+ form (INC-32) with ROC',
          'Upload MOA (INC-33) and AOA (INC-34)',
          'Receive Certificate of Incorporation with CIN'
        ],
        estimatedTime: '3-7 business days',
        estimatedCost: 'Rs. 5,000 - Rs. 15,000 (government fees + professional fees)',
        validity: 'Permanent (until dissolved)',
        officialRef: 'Companies Act, 2013 - Section 3',
        priority: 'critical'
      },
      {
        type: 'gst_certificate',
        name: 'GST Registration Certificate',
        shortName: 'GST Certificate',
        icon: '📋',
        description: 'Registration under the Goods and Services Tax (GST) regime, providing a unique GSTIN (15-digit GST Identification Number). Mandatory for businesses exceeding the turnover threshold.',
        whyNeeded: 'GST registration is required to collect tax on sales, claim input tax credit, and file periodic returns. Without it, you cannot legally collect GST from customers or claim credit on purchases.',
        portal: { name: 'GST Portal', url: 'https://www.gst.gov.in' },
        documentsRequired: [
          'PAN Card of the business/proprietor',
          'Aadhaar Card of authorized signatory',
          'Proof of business premises (rent agreement/property document)',
          'Bank account statement (front page)',
          'Photograph of authorized signatory',
          'Board resolution / Authorization letter'
        ],
        process: [
          'Apply online at gst.gov.in using Form GST REG-01',
          'Upload required documents',
          'Complete Aadhaar authentication for verification',
          'Receive Application Reference Number (ARN)',
          'GST officer verifies application',
          'Receive GSTIN and GST Registration Certificate'
        ],
        estimatedTime: '3-7 business days (if Aadhaar authenticated)',
        estimatedCost: 'Free (government fees nil)',
        validity: 'Permanent (until cancelled)',
        officialRef: 'CGST Act, 2017 - Section 22',
        priority: 'critical'
      },
      {
        type: 'pan_card',
        name: 'Company PAN Card',
        shortName: 'PAN',
        icon: '💳',
        description: 'Permanent Account Number (PAN) card issued by the Income Tax Department for the company entity. Unique 10-character alphanumeric identifier for tax purposes.',
        whyNeeded: 'PAN is mandatory for all financial transactions including opening bank accounts, filing income tax returns, making investments, and TDS compliance. No financial transaction above Rs. 50,000 can be done without PAN.',
        portal: { name: 'NSDL Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' },
        documentsRequired: [
          'Certificate of Incorporation',
          'Board Resolution authorizing signatory',
          'Aadhaar of authorized signatory',
          'Form 49A (application form)',
          'Company seal (if applicable)'
        ],
        process: [
          'Fill Form 49A online at NSDL/UTIITSL portal',
          'Upload company incorporation certificate',
          'Upload Aadhaar of authorized signatory',
          'Pay application fee online',
          'Receive PAN number (instant e-PAN available)',
          'Physical PAN card delivered in 15-20 days'
        ],
        estimatedTime: '15-20 business days (physical card); Instant (e-PAN)',
        estimatedCost: 'Rs. 107 (Indian address); Rs. 1,017 (foreign address)',
        validity: 'Permanent',
        officialRef: 'Income Tax Act, 1961 - Section 139A',
        priority: 'critical'
      }
    ],
    industries: {
      'Information Technology (IT)': [
        {
          type: 'dpdp_registration',
          name: 'DPDP Act Compliance Registration',
          shortName: 'DPDP',
          icon: '🔒',
          description: 'Compliance with the Digital Personal Data Protection Act, 2023. IT companies handling personal data must register as Data Fiduciaries and implement consent management systems.',
          whyNeeded: 'If your IT company processes personal data of Indian citizens, you must comply with DPDP Act. Non-compliance can attract penalties up to Rs. 250 Crore.',
          portal: { name: 'DPDP Portal (expected)', url: 'https://dpdp.gov.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'PAN and GST certificates',
            'Data processing inventory',
            'Privacy policy document',
            'Consent management framework',
            'Data Protection Officer details (if applicable)'
          ],
          process: [
            'Classify your organization as Data Fiduciary or Data Processor',
            'Appoint Data Protection Officer (if required)',
            'Create comprehensive privacy policy',
            'Implement consent management system',
            'Register on DPDP portal when notified',
            'Conduct data protection impact assessment'
          ],
          estimatedTime: '30-60 days (implementation + registration)',
          estimatedCost: 'Rs. 25,000 - Rs. 2,00,000 (compliance setup)',
          validity: 'Annual renewal',
          officialRef: 'Digital Personal Data Protection Act, 2023',
          priority: 'critical'
        },
        {
          type: 'it_act_compliance',
          name: 'IT Act Section 43A Compliance',
          shortName: 'IT Act 43A',
          icon: '🛡️',
          description: 'Implementation of reasonable security practices for sensitive personal data as required under Section 43A of the Information Technology Act, 2000.',
          whyNeeded: 'IT companies handling sensitive personal data (financial, health, biometric, etc.) must implement ISO 27001 or equivalent security practices. Failure can lead to compensation up to Rs. 5 Crore.',
          portal: { name: 'MeitY', url: 'https://www.meity.gov.in' },
          documentsRequired: [
            'Information Security Policy document',
            'ISO 27001 certificate (recommended)',
            'Data classification matrix',
            'Access control policies',
            'Incident response plan',
            'Employee training records'
          ],
          process: [
            'Develop Information Security Policy',
            'Implement ISO 27001 or ISMS framework',
            'Conduct risk assessment',
            'Deploy technical security measures',
            'Train employees on data protection',
            'Conduct periodic audits'
          ],
          estimatedTime: '60-90 days (full implementation)',
          estimatedCost: 'Rs. 50,000 - Rs. 5,00,000 (depending on company size)',
          validity: 'Annual audit required',
          officialRef: 'IT Act, 2000 - Section 43A + IT (Reasonable Security Practices) Rules, 2011',
          priority: 'high'
        },
        {
          type: 'stpi_registration',
          name: 'STPI/Software Export Registration',
          shortName: 'STPI',
          icon: '🌐',
          description: 'Registration with Software Technology Parks of India (STPI) for software export benefits and tax exemptions under the STPI scheme.',
          whyNeeded: 'Required only if you export software services. Provides tax benefits under Section 10AA of the Income Tax Act. Optional if you don\'t export.',
          portal: { name: 'STPI Portal', url: 'https://www.stpi.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'GST registration',
            'Import-Export Code (if available)',
            'Software export contracts/agreements',
            'Bank account details for forex transactions'
          ],
          process: [
            'Apply online at STPI portal',
            'Submit application with required documents',
            'STPI committee reviews application',
            'Receive STPI registration certificate',
            'Set up unit in STPI designated area (if applicable)',
            'File periodic returns for export data'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 25,000',
          validity: 'Annual renewal',
          officialRef: 'STPI Act, 1991',
          priority: 'low'
        }
      ],
      'IT-ITeS / BPO / KPO': [
        {
          type: 'dpdp_registration',
          name: 'DPDP Act Compliance Registration',
          shortName: 'DPDP',
          icon: '🔒',
          description: 'Compliance with the Digital Personal Data Protection Act, 2023. Critical for BPO/KPO handling large volumes of personal data.',
          whyNeeded: 'BPO/KPO operations process massive amounts of personal data. DPDP Act compliance is mandatory to avoid penalties up to Rs. 250 Crore.',
          portal: { name: 'DPDP Portal', url: 'https://dpdp.gov.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'Data processing agreements with clients',
            'Privacy policy and consent forms',
            'Data Protection Officer appointment letter',
            'Data security audit reports',
            'Employee NDAs and training records'
          ],
          process: [
            'Appoint Data Protection Officer',
            'Create data processing inventory',
            'Implement consent management for all data subjects',
            'Deploy data encryption and access controls',
            'Register on DPDP portal',
            'Conduct regular compliance audits'
          ],
          estimatedTime: '30-60 days',
          estimatedCost: 'Rs. 50,000 - Rs. 3,00,000',
          validity: 'Annual renewal',
          officialRef: 'Digital Personal Data Protection Act, 2023',
          priority: 'critical'
        },
        {
          type: 'dot_registration',
          name: 'DoT Registration for BPO',
          shortName: 'DoT',
          icon: '📡',
          description: 'Department of Telecommunications registration required for BPO/KPO operations using telecommunication services.',
          whyNeeded: 'Mandatory for BPOs and KPOs operating call centers or using telecom infrastructure for business.',
          portal: { name: 'DoT Portal', url: 'https://www.dot.gov.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'Telecom equipment details',
            'Network architecture diagram',
            'Security clearance certificates',
            'Address proof of all call center locations'
          ],
          process: [
            'Apply for Unified License (UL) or specific category license',
            'Submit network and infrastructure details',
            'Obtain security clearance from MHA',
            'Receive DoT registration certificate',
            'Comply with lawful interception requirements'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 5,00,000',
          validity: '15 years (renewable)',
          officialRef: 'Indian Telegraph Act, 1885',
          priority: 'high'
        }
      ],
      'Financial Services & FinTech': [
        {
          type: 'rbi_registration',
          name: 'RBI Registration/Authorization',
          shortName: 'RBI',
          icon: '🏦',
          description: 'Registration or authorization from the Reserve Bank of India for financial services operations.',
          whyNeeded: 'Any financial services business (lending, payments, wallets, NBFC) requires RBI authorization. Operating without it is a criminal offence with penalties up to Rs. 10 Crore.',
          portal: { name: 'RBI Portal', url: 'https://www.rbi.org.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'Detailed business plan',
            'Net worth certificates',
            'KYC/AML policies',
            'IT security framework',
            'Board composition details',
            'Fit and proper declarations'
          ],
          process: [
            'Determine applicable category (NBFC, PA, PPI, etc.)',
            'Prepare detailed application with business plan',
            'Submit application to RBI with all documents',
            'RBI conducts due diligence and site inspection',
            'Receive in-principle approval',
            'Comply with conditions and receive final certificate'
          ],
          estimatedTime: '60-180 business days',
          estimatedCost: 'Rs. 1,00,000 - Rs. 10,00,000',
          validity: 'Permanent (with annual compliance)',
          officialRef: 'RBI Act, 1934 / Payment and Settlement Systems Act, 2007',
          priority: 'critical'
        },
        {
          type: 'sebi_registration',
          name: 'SEBI Registration',
          shortName: 'SEBI',
          icon: '📊',
          description: 'Securities and Exchange Board of India registration for market intermediaries.',
          whyNeeded: 'Required for investment advisory, portfolio management, stock broking, and other securities market activities.',
          portal: { name: 'SEBI Portal', url: 'https://www.sebi.gov.in' },
          documentsRequired: [
            'RBI authorization (if applicable)',
            'Net worth certificates',
            'Principal Officer qualifications',
            'Compliance officer details',
            'Risk management framework',
            'KYC/AML framework'
          ],
          process: [
            'Determine applicable SEBI category',
            'Prepare application with required net worth',
            'Submit application online via SEBI portal',
            'SEBI examines application and raises queries',
            'Respond to queries and provide additional documents',
            'Receive SEBI registration certificate'
          ],
          estimatedTime: '90-180 business days',
          estimatedCost: 'Rs. 2,00,000 - Rs. 15,00,000',
          validity: 'Permanent (with annual compliance)',
          officialRef: 'SEBI Act, 1992',
          priority: 'critical'
        }
      ],
      'Banking & Insurance': [
        {
          type: 'rbi_banking_license',
          name: 'RBI Banking License',
          shortName: 'Banking License',
          icon: '🏛️',
          description: 'Full banking license from the Reserve Bank of India to accept deposits and conduct banking operations.',
          whyNeeded: 'Mandatory for any entity wanting to operate as a bank in India. Extremely rigorous process with minimum capital requirements.',
          portal: { name: 'RBI Portal', url: 'https://www.rbi.org.in' },
          documentsRequired: [
            'Detailed business plan (5-year projections)',
            'Minimum paid-up capital of Rs. 500 Crore',
            'Promoter details and fit & proper certificates',
            'Fair practices code',
            'IT infrastructure plan',
            'Anti-money laundering framework',
            'Capital adequacy framework (BASEL III)'
          ],
          process: [
            'Apply for in-principle approval from RBI',
            'Incorporate the bank as a company',
            'Comply with all conditions in in-principle approval',
            'Obtain final banking license from RBI',
            'Commence banking operations within 18 months'
          ],
          estimatedTime: '12-24 months',
          estimatedCost: 'Rs. 500 Crore+ (minimum capital)',
          validity: 'Permanent (with ongoing compliance)',
          officialRef: 'Banking Regulation Act, 1949',
          priority: 'critical'
        },
        {
          type: 'irdai_registration',
          name: 'IRDAI Insurance Registration',
          shortName: 'IRDAI',
          icon: '🛡️',
          description: 'Insurance Regulatory and Development Authority of India registration for insurance companies, agents, and intermediaries.',
          whyNeeded: 'Required for all insurance-related operations including life, general, and health insurance.',
          portal: { name: 'IRDAI Portal', url: 'https://www.irdai.gov.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'Minimum paid-up capital (Rs. 400 Cr for life, Rs. 200 Cr for general)',
            'Actuary appointment letter',
            'Investment management agreement',
            'Reinsurance arrangement details',
            'Solvency margin certificates'
          ],
          process: [
            'Apply for Certificate of Registration (CoR)',
            'Submit detailed application with business plan',
            'IRDAI examines application and conducts inspection',
            'Comply with capital and solvency requirements',
            'Receive CoR from IRDAI',
            'Commence insurance operations'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 200-400 Crore (minimum capital)',
          validity: 'Permanent (with annual renewal)',
          officialRef: 'Insurance Act, 1938 / IRDAI Act, 1999',
          priority: 'critical'
        }
      ],
      'Healthcare Services': [
        {
          type: 'clinical_registration',
          name: 'Clinical Establishments Registration',
          shortName: 'Clinical Registration',
          icon: '🏥',
          description: 'Registration under the Clinical Establishments (Registration and Regulation) Act, 2010 for all clinical establishments.',
          whyNeeded: 'Mandatory for all healthcare facilities including hospitals, clinics, diagnostic centers, and polyclinics. Operating without registration attracts penalties.',
          portal: { name: 'NCGE Portal', url: 'https://www.ncgeindia.gov.in' },
          documentsRequired: [
            'NOC from local authority',
            'Building plan approval',
            'Fire safety certificate',
            'Medical officer qualifications',
            'Equipment list and calibration certificates',
            'Waste management plan',
            'Staff qualification certificates'
          ],
          process: [
            'Apply online at National Clinical Establishments Portal',
            'Submit required NOCs and certificates',
            'Pay registration fee',
            'State/UT council reviews application',
            'Inspection by district-level committee',
            'Receive registration certificate'
          ],
          estimatedTime: '30-90 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 50,000',
          validity: '5 years (renewable)',
          officialRef: 'Clinical Establishments Act, 2010',
          priority: 'critical'
        },
        {
          type: 'nabh_accreditation',
          name: 'NABH/NABL Accreditation',
          shortName: 'NABH',
          icon: '⭐',
          description: 'National Accreditation Board for Hospitals & Healthcare Providers (NABH) accreditation for quality standards.',
          whyNeeded: 'Not mandatory but increasingly required for empanelment under government insurance schemes (Ayushman Bharat) and corporate tie-ups.',
          portal: { name: 'NABH Portal', url: 'https://www.nabh.co.in' },
          documentsRequired: [
            'Hospital registration certificate',
            'ClinicalEstablishments registration',
            'Quality manuals and SOPs',
            'Staff qualification and training records',
            'Equipment maintenance records',
            'Patient safety protocols',
            'Infection control policies'
          ],
          process: [
            'Self-assessment against NABH standards',
            'Submit application with applicable fees',
            'NABH conducts document review',
            'Pre-assessment visit by NABH team',
            'Address non-conformities',
            'Final assessment and accreditation'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 2,00,000 - Rs. 10,00,000',
          validity: '3 years',
          officialRef: 'NABH Accreditation Standards',
          priority: 'medium'
        }
      ],
      'Education & EdTech': [
        {
          type: 'ugc_recognition',
          name: 'UGC/AICTE Recognition',
          shortName: 'UGC/AICTE',
          icon: '🎓',
          description: 'Recognition from University Grants Commission (UGC) or All India Council for Technical Education (AICTE) for educational institutions.',
          whyNeeded: 'Mandatory for any institution offering degrees or technical education. EdTech platforms offering recognized programs must comply.',
          portal: { name: 'UGC Portal', url: 'https://www.ugc.ac.in' },
          documentsRequired: [
            'Society/Trust registration certificate',
            'Land ownership or lease documents',
            'Building plan approval',
            'Faculty qualifications',
            'Infrastructure details',
            'Financial sustainability plan',
            'Academic framework and curriculum'
          ],
          process: [
            'Apply for recognition to UGC/AICTE',
            'Submit infrastructure and faculty details',
            'Pay application and inspection fees',
            'Expert committee visits and inspects',
            'Address recommendations',
            'Receive recognition letter'
          ],
          estimatedTime: '3-12 months',
          estimatedCost: 'Rs. 50,000 - Rs. 5,00,000',
          validity: '5 years (renewable)',
          officialRef: 'UGC Act, 1956 / AICTE Act, 1987',
          priority: 'critical'
        }
      ],
      'Hospitality & Tourism': [
        {
          type: 'fssai_license',
          name: 'FSSAI Food Service License',
          shortName: 'FSSAI',
          icon: '🍽️',
          description: 'Food Safety and Standards Authority of India license for food service operations in hotels, restaurants, and cafes.',
          whyNeeded: 'Mandatory for any business involved in food handling, preparation, or serving. Operating without FSSAI attracts up to Rs. 5 Lakh fine and 6 months imprisonment.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'Company/proprietor PAN and Aadhaar',
            'Food safety management plan',
            'List of food categories handled',
            'Kitchen layout and equipment details',
            'Water testing report',
            'Medical fitness certificates of food handlers',
            'NOC from local municipality'
          ],
          process: [
            'Apply online at fssai.gov.in',
            'Submit food safety management plan',
            'Upload required documents',
            'FBO receives application reference',
            'FSSAI officer inspects premises',
            'Receive FSSAI license'
          ],
          estimatedTime: '7-30 business days',
          estimatedCost: 'Rs. 2,000 - Rs. 7,500 per year (based on turnover)',
          validity: '1-5 years (as chosen)',
          officialRef: 'Food Safety and Standards Act, 2006',
          priority: 'critical'
        },
        {
          type: 'fire_safety_noc',
          name: 'Fire Safety NOC',
          shortName: 'Fire NOC',
          icon: '🔥',
          description: 'No Objection Certificate from the State Fire Service Department for fire safety compliance.',
          whyNeeded: 'Mandatory for all commercial buildings including hotels and restaurants. Required for insurance claims and business continuity.',
          portal: { name: 'State Fire Department', url: 'https://fire.odisha.gov.in' },
          documentsRequired: [
            'Building plan approval',
            'Fire safety measures certificate',
            'Fire extinguisher purchase receipts',
            'Emergency evacuation plan',
            'Fire alarm system certificate',
            'Building occupancy certificate'
          ],
          process: [
            'Apply to State Fire Department',
            'Submit building plans and fire safety measures',
            'Pay application fee',
            'Fire officer inspects premises',
            'Install required fire safety equipment',
            'Receive Fire Safety NOC'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 50,000',
          validity: '1-3 years (renewable)',
          officialRef: 'National Building Code of India, 2016',
          priority: 'high'
        }
      ],
      'Real Estate & Construction': [
        {
          type: 'rera_registration',
          name: 'RERA Registration',
          shortName: 'RERA',
          icon: '🏗️',
          description: 'Real Estate Regulatory Authority registration for real estate projects and agents.',
          whyNeeded: 'Mandatory under the Real Estate (Regulation and Development) Act, 2016. All real estate projects must be registered before advertising or selling.',
          portal: { name: 'State RERA Portal', url: 'https://reraonline.in' },
          documentsRequired: [
            'Company incorporation certificate',
            'Land title documents',
            'Approved building plans',
            'Project layout and specifications',
            'Financial statements and bank guarantees',
            'Architect and engineer certificates',
            'Environmental clearances'
          ],
          process: [
            'Register on State RERA portal',
            'Submit project details and documents',
            'Pay registration fee (based on project size)',
            'RERA authority reviews application',
            'Receive RERA registration number',
            'Display registration number in all advertisements'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 50,000 - Rs. 5,00,000 (based on project size)',
          validity: 'Until project completion + 5 years',
          officialRef: 'Real Estate (Regulation and Development) Act, 2016',
          priority: 'critical'
        }
      ],
      'Logistics & Supply Chain': [
        {
          type: 'transport_permit',
          name: 'Transport Permit (Motor Vehicle Act)',
          shortName: 'Transport Permit',
          icon: '🚛',
          description: 'Commercial transport permits under the Motor Vehicles Act for fleet operations.',
          whyNeeded: 'Mandatory for any business operating commercial vehicles for goods or passenger transport.',
          portal: { name: 'State Transport Portal', url: 'https://transport.gov.in' },
          documentsRequired: [
            'Vehicle fitness certificate',
            'Insurance certificates',
            'Driver commercial license',
            'Route permission',
            'Pollution under control certificate',
            'Tax payment receipts'
          ],
          process: [
            'Apply to State Transport Authority',
            'Submit vehicle and driver documents',
            'Pay permit fees and road tax',
            'Vehicle inspection by RTO',
            'Receive transport permit',
            'Display permit in vehicle'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 50,000 per vehicle',
          validity: '5 years (renewable)',
          officialRef: 'Motor Vehicles Act, 1988',
          priority: 'high'
        }
      ],
      'Telecom': [
        {
          type: 'telecom_license',
          name: 'Telecom License Compliance',
          shortName: 'Telecom License',
          icon: '📡',
          description: 'Maintaining telecom license as per Department of Telecommunications (DoT) guidelines.',
          whyNeeded: 'Mandatory for all telecom service providers. Operating without license attracts penalty up to Rs. 10 Crore.',
          portal: { name: 'DoT Portal', url: 'https://dot.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Import license for equipment',
            'Network details and coverage plan',
            'Financial capacity documents',
            'Security clearance',
            'Compliance with Indian Telecom Security Guidelines'
          ],
          process: [
            'Apply for Unified License from DoT',
            'Submit technical and financial documents',
            'DoT reviews application',
            'Security clearance by MHA',
            'Receive telecom license',
            'Comply with license conditions'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 50,00,000 - Rs. 5,00,00,000 (license fee varies by service area)',
          validity: '20 years',
          officialRef: 'Indian Telegraph Act, 1885 / Unified License Agreement',
          priority: 'critical'
        },
        {
          type: 'spectrum_charges',
          name: 'Spectrum Usage Charges',
          shortName: 'SUC',
          icon: '📶',
          description: 'Quarterly spectrum usage charges for wireless telecom operations.',
          whyNeeded: 'Mandatory for all telecom operators using allocated spectrum. Non-payment attracts interest and penalties.',
          portal: { name: 'DoT Portal', url: 'https://dot.gov.in' },
          documentsRequired: [
            'Spectrum allocation letter',
            'Revenue statements',
            'Subscriber base data',
            'Payment challans'
          ],
          process: [
            'Calculate spectrum charges based on AGR',
            'File quarterly statements',
            'Pay charges by due date',
            'Maintain records for audit'
          ],
          estimatedTime: 'Ongoing quarterly',
          estimatedCost: 'Varies based on spectrum and revenue',
          validity: 'Ongoing',
          officialRef: 'Indian Telegraph Act, 1885 / Unified License Agreement',
          priority: 'high'
        }
      ],
      'Digital Marketing & Media': [
        {
          type: 'it_intermediary_media',
          name: 'IT Act Intermediary Guidelines',
          shortName: 'Intermediary Guidelines',
          icon: '🌐',
          description: 'Compliance with IT Intermediary Guidelines for digital platforms and media.',
          whyNeeded: 'Mandatory for digital platforms hosting user content. Loss of intermediary immunity means direct liability.',
          portal: { name: 'MeitY Portal', url: 'https://www.meity.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Privacy policy and terms of service',
            'Grievance officer appointment',
            'Content moderation policies',
            'Compliance framework'
          ],
          process: [
            'Appoint Grievance Officer based in India',
            'Publish privacy policy and terms',
            'Implement content moderation framework',
            'Enable traceability where required',
            'File compliance reports with MeitY'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 50,000 (compliance setup)',
          validity: 'Ongoing',
          officialRef: 'Information Technology Act, 2000 / Intermediary Guidelines, 2021',
          priority: 'medium'
        }
      ],
      'Legal & Accounting Services': [
        {
          type: 'bar_council',
          name: 'Bar Council Compliance',
          shortName: 'Bar Council',
          icon: '⚖️',
          description: 'Maintaining Bar Council registration for advocates and legal practitioners.',
          whyNeeded: 'Mandatory for practicing law in India. Practicing without valid Bar Council enrollment is an offence.',
          portal: { name: 'Bar Council of India', url: 'https://www.barcouncilofindia.org' },
          documentsRequired: [
            'Law degree certificate',
            'Bar Council enrollment certificate',
            'Identity proof',
            'Address proof',
            'Chamber/office details'
          ],
          process: [
            'Enroll with State Bar Council',
            'Appear for Bar Council exam (if required)',
            'Pay enrollment fees',
            'Receive enrollment certificate',
            'Renew annually'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 25,000',
          validity: 'Annual renewal',
          officialRef: 'Advocates Act, 1961',
          priority: 'critical'
        },
        {
          type: 'icai_registration',
          name: 'ICAI Registration (CA Firms)',
          shortName: 'ICAI',
          icon: '📊',
          description: 'Registration with Institute of Chartered Accountants of India for CA firms.',
          whyNeeded: 'Mandatory for firms providing accounting and audit services. Must maintain ICAI membership.',
          portal: { name: 'ICAI Portal', url: 'https://www.icai.org' },
          documentsRequired: [
            'CA membership certificate',
            'Firm registration certificate',
            'Partnership deed (if applicable)',
            'Office address proof'
          ],
          process: [
            'Apply for firm registration with ICAI',
            'Submit required documents',
            'ICAI reviews and approves',
            'Receive firm registration number',
            'Maintain annual membership'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 15,000',
          validity: 'Annual renewal',
          officialRef: 'Chartered Accountants Act, 1949',
          priority: 'critical'
        }
      ],
      'Advertising & PR': [
        {
          type: 'asci_compliance',
          name: 'ASCI Code Compliance',
          shortName: 'ASCI',
          icon: '📢',
          description: 'Compliance with Advertising Standards Council of India (ASCI) code.',
          whyNeeded: 'Voluntary but recommended for all advertisers. Ensures advertisements are not misleading or offensive.',
          portal: { name: 'ASCI Portal', url: 'https://www.ascionline.in' },
          documentsRequired: [
            'Advertisement content/copy',
            'Substantiation documents',
            'Disclaimers and caveats',
            'Client authorization'
          ],
          process: [
            'Review advertisement against ASCI code',
            'Submit to ASCI for pre-clearance (if required)',
            'Address any objections',
            'Obtain clearance certificate',
            'Maintain records of substantiation'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 25,000 per advertisement',
          validity: 'Per advertisement',
          officialRef: 'ASCI Code for Self-Regulation in Advertising',
          priority: 'medium'
        }
      ],
      'Transportation & Courier': [
        {
          type: 'transport_permit_courier',
          name: 'Transport Permit (Motor Vehicle Act)',
          shortName: 'Transport Permit',
          icon: '🚚',
          description: 'Commercial transport permits for courier and logistics operations.',
          whyNeeded: 'Mandatory for operating commercial vehicles for goods transport.',
          portal: { name: 'State Transport Portal', url: 'https://transport.gov.in' },
          documentsRequired: [
            'Vehicle fitness certificate',
            'Insurance certificates',
            'Driver commercial license',
            'Route permission',
            'Pollution under control certificate',
            'Tax payment receipts'
          ],
          process: [
            'Apply to State Transport Authority',
            'Submit vehicle and driver documents',
            'Pay permit fees and road tax',
            'Vehicle inspection by RTO',
            'Receive transport permit',
            'Display permit in vehicle'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 50,000 per vehicle',
          validity: '5 years (renewable)',
          officialRef: 'Motor Vehicles Act, 1988',
          priority: 'high'
        },
        {
          type: 'courier_license',
          name: 'Courier License (DoT)',
          shortName: 'Courier License',
          icon: '📮',
          description: 'License for operating courier services from Department of Telecommunications.',
          whyNeeded: 'Mandatory for operating courier services. Must comply with DoT guidelines for courier operators.',
          portal: { name: 'DoT Portal', url: 'https://dot.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Office address proof',
            'Vehicle ownership documents',
            'Insurance certificates',
            'GST registration'
          ],
          process: [
            'Apply to DoT for courier license',
            'Submit required documents',
            'Pay license fee',
            'Receive courier license',
            'Comply with operational guidelines'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 50,000',
          validity: '5 years',
          officialRef: 'Indian Telegraph Act, 1885 / Courier Rules',
          priority: 'high'
        }
      ]
    }
  },

  manufacturing: {
    common: [
      {
        type: 'company_registration',
        name: 'Company Registration Certificate',
        shortName: 'Certificate of Incorporation',
        icon: '📄',
        description: 'Certificate of Incorporation issued by the Registrar of Companies (ROC) under the Ministry of Corporate Affairs (MCA).',
        whyNeeded: 'Every manufacturing company must be registered under the Companies Act, 2013 to operate as a legal entity.',
        portal: { name: 'MCA Portal', url: 'https://www.mca.gov.in' },
        documentsRequired: [
          'Director Aadhaar & PAN cards',
          'Registered office address proof',
          'Memorandum of Association (MOA)',
          'Articles of Association (AOA)',
          'Board Resolution'
        ],
        process: [
          'Apply for DSC for all directors',
          'Apply for DIN via SPICe+',
          'Reserve company name via RUN',
          'File SPICe+ form with ROC',
          'Upload MOA and AOA',
          'Receive Certificate of Incorporation'
        ],
        estimatedTime: '3-7 business days',
        estimatedCost: 'Rs. 5,000 - Rs. 15,000',
        validity: 'Permanent',
        officialRef: 'Companies Act, 2013 - Section 3',
        priority: 'critical'
      },
      {
        type: 'factory_license',
        name: 'Factory License',
        shortName: 'Factory License',
        icon: '🏭',
        description: 'License issued by the State Labour Department under the Factories Act, 1948 for premises where manufacturing is carried out with 10+ workers (with power) or 20+ workers (without power).',
        whyNeeded: 'Mandatory under the Factories Act, 1948. Operating a factory without a license can lead to imprisonment up to 2 years and fines up to Rs. 5 Lakh.',
        portal: { name: 'State Labour Portal', url: 'https://labour.gov.in' },
        documentsRequired: [
          'Approved building plan from Chief Inspector',
          'Site plan of the factory',
          'Process flow diagram',
          'List of machinery with HP details',
          'Safety and health policy',
          'Medical fitness certificates of workers',
          'Fire safety certificate',
          'Environmental clearance (if applicable)'
        ],
        process: [
          'Obtain building plan approval from Chief Inspector of Factories',
          'Construct factory as per approved plan',
          'Apply for Factory License with Form 1',
          'Submit all required documents',
          'Factory Inspector inspects premises',
          'Receive Factory License'
        ],
        estimatedTime: '30-60 business days',
        estimatedCost: 'Rs. 5,000 - Rs. 50,000 (based on number of workers)',
        validity: '1 year (annual renewal)',
        officialRef: 'Factories Act, 1948 - Sections 6-11',
        priority: 'critical'
      },
      {
        type: 'pollution_consent',
        name: 'Pollution Board Consent (CTE/CTO)',
        shortName: 'Pollution Consent',
        icon: '🌿',
        description: 'Consent to Establish (CTE) and Consent to Operate (CTO) from the State Pollution Control Board (SPCB) under the Water Act and Air Act.',
        whyNeeded: 'Mandatory for all manufacturing units. CTE must be obtained before construction, CTO before commencing operations. Non-compliance leads to fines up to Rs. 5 Crore and imprisonment up to 5 years.',
        portal: { name: 'SPCB Portal', url: 'https://moef.gov.in' },
        documentsRequired: [
          'Environmental Impact Assessment (EIA)',
          'Process flow diagram with raw materials',
          'Waste management plan (solid, liquid, hazardous)',
          'Air emission calculations',
          'Water consumption and discharge details',
          'Hazardous waste storage plan',
          'Ambient air quality monitoring data',
          'Consent fee payment receipts'
        ],
        process: [
          'Apply for Consent to Establish (CTE) before construction',
          'Submit EIA and project details to SPCB',
          'SPCB reviews and may conduct site visit',
          'Receive CTE with conditions',
          'Implement pollution control measures',
          'Apply for Consent to Operate (CTO) after commissioning',
          'SPCB inspects and grants CTO'
        ],
        estimatedTime: '60-120 business days',
        estimatedCost: 'Rs. 10,000 - Rs. 5,00,000 (based on category)',
        validity: 'CTE: Until project completion; CTO: 5-10 years',
        officialRef: 'Water Act, 1974 / Air Act, 1981',
        priority: 'critical'
      },
      {
        type: 'pan_card',
        name: 'Company PAN Card',
        shortName: 'PAN',
        icon: '💳',
        description: 'Permanent Account Number (PAN) card for the manufacturing company entity.',
        whyNeeded: 'Mandatory for all financial transactions, tax filing, and banking operations.',
        portal: { name: 'NSDL Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' },
        documentsRequired: [
          'Certificate of Incorporation',
          'Board Resolution',
          'Aadhaar of authorized signatory'
        ],
        process: [
          'Fill Form 49A online at NSDL',
          'Upload incorporation certificate',
          'Pay application fee',
          'Receive PAN number (instant e-PAN)',
          'Physical card delivered in 15-20 days'
        ],
        estimatedTime: '15-20 business days (physical); Instant (e-PAN)',
        estimatedCost: 'Rs. 107',
        validity: 'Permanent',
        officialRef: 'Income Tax Act, 1961 - Section 139A',
        priority: 'critical'
      },
      {
        type: 'gst_certificate',
        name: 'GST Registration Certificate',
        shortName: 'GST Certificate',
        icon: '📋',
        description: 'GST registration for the manufacturing unit to collect and pay GST on goods manufactured and sold.',
        whyNeeded: 'Mandatory for all manufacturers. GST compliance is required for selling goods within India and for claiming input tax credit on raw materials.',
        portal: { name: 'GST Portal', url: 'https://www.gst.gov.in' },
        documentsRequired: [
          'PAN Card',
          'Aadhaar of authorized signatory',
          'Factory address proof',
          'Bank account statement',
          'Photograph of authorized signatory'
        ],
        process: [
          'Apply online at gst.gov.in',
          'Upload required documents',
          'Complete Aadhaar authentication',
          'Receive ARN',
          'GST officer verifies',
          'Receive GSTIN'
        ],
        estimatedTime: '3-7 business days',
        estimatedCost: 'Free',
        validity: 'Permanent',
        officialRef: 'CGST Act, 2017 - Section 22',
        priority: 'critical'
      }
    ],
    industries: {
      'Automobile & Auto Components': [
        {
          type: 'arai_type_approval',
          name: 'ARAI/ICAT Type Approval',
          shortName: 'Type Approval',
          icon: '🚗',
          description: 'Type approval from ARAI (Automotive Research Association of India) or ICAT for vehicle components and systems.',
          whyNeeded: 'Mandatory for manufacturing automobile components that affect vehicle safety and emissions. Required by CMVR (Central Motor Vehicles Rules).',
          portal: { name: 'ARAI Portal', url: 'https://www.araiindia.com' },
          documentsRequired: [
            'Product design and technical specifications',
            'Manufacturing process flow',
            'Quality management system certificates',
            'Test reports from NABL-accredited labs',
            'Type approval application form'
          ],
          process: [
            'Submit type approval application to ARAI/ICAT',
            'Provide product samples for testing',
            'ARAI/ICAT tests against applicable standards',
            'Receive type approval certificate',
            'Comply with marking requirements'
          ],
          estimatedTime: '30-90 business days',
          estimatedCost: 'Rs. 50,000 - Rs. 5,00,000 per product',
          validity: '3-5 years',
          officialRef: 'Central Motor Vehicles Rules, 1989',
          priority: 'critical'
        },
        {
          type: 'iatf_certification',
          name: 'IATF 16949 Certification',
          shortName: 'IATF',
          icon: '🏆',
          description: 'IATF 16949 quality management system certification specific to the automotive industry.',
          whyNeeded: 'Required by most OEMs (Original Equipment Manufacturers) as a prerequisite for supplying auto components. Loss of certification means loss of business.',
          portal: { name: 'IATF Portal', url: 'https://www.iatfglobaloversight.org' },
          documentsRequired: [
            'ISO 9001 certificate',
            'Quality manual and procedures',
            'Process flow diagrams',
            'Control plans',
            'FMEA documents',
            'Internal audit records',
            'Management review minutes'
          ],
          process: [
            'Implement IATF 16949 requirements',
            'Conduct internal audit',
            'Choose IATF-recognized certification body',
            'Stage 1 audit (documentation review)',
            'Stage 2 audit (implementation audit)',
            'Address non-conformities and receive certificate'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 2,00,000 - Rs. 10,00,000',
          validity: '3 years (annual surveillance audits)',
          officialRef: 'IATF 16949:2016 Standard',
          priority: 'high'
        }
      ],
      'Pharmaceuticals & Medical Devices': [
        {
          type: 'drug_manufacturing_license',
          name: 'Drug Manufacturing License (Form 25)',
          shortName: 'Drug License',
          icon: '💊',
          description: 'Manufacturing license from CDSCO (Central Drugs Standard Control Organisation) for pharmaceutical production.',
          whyNeeded: 'Mandatory for manufacturing any drug or pharmaceutical product. Operating without this license is a criminal offence with imprisonment up to 3 years.',
          portal: { name: 'CDSCO Portal', url: 'https://cdsco.gov.in' },
          documentsRequired: [
            'Factory layout and floor plan',
            'List of manufacturing sections',
            'Qualification documents of key personnel',
            'Drug product list with specifications',
            'Quality control laboratory details',
            'Plant and equipment qualification documents',
            'Environmental monitoring data'
          ],
          process: [
            'Apply to CDSCO via Form 25',
            'Submit manufacturing details and documents',
            'CDSCO conducts pre-licensing inspection',
            'Address observations and implement corrective actions',
            'CDSCO re-inspects if needed',
            'Receive Drug Manufacturing License'
          ],
          estimatedTime: '90-180 business days',
          estimatedCost: 'Rs. 50,000 - Rs. 5,00,000',
          validity: '1-5 years (renewable)',
          officialRef: 'Drugs and Cosmetics Act, 1940 - Section 18',
          priority: 'critical'
        },
        {
          type: 'gmp_certificate',
          name: 'Schedule M / WHO-GMP Certificate',
          shortName: 'GMP',
          icon: '✅',
          description: 'Good Manufacturing Practices compliance certificate under Schedule M of the Drugs and Cosmetics Rules.',
          whyNeeded: 'Mandatory for all pharmaceutical manufacturers. Ensures drugs are consistently produced and controlled according to quality standards.',
          portal: { name: 'CDSCO Portal', url: 'https://cdsco.gov.in' },
          documentsRequired: [
            'GMP compliance manual',
            'Validation protocols and reports',
            'Equipment qualification documents',
            'Environmental monitoring records',
            'Batch manufacturing records',
            'Deviation and CAPA procedures'
          ],
          process: [
            'Implement GMP requirements as per Schedule M',
            'Prepare GMP documentation',
            'Self-assess against GMP standards',
            'Apply for GMP inspection to CDSCO',
            'CDSCO inspects manufacturing facility',
            'Receive GMP certificate'
          ],
          estimatedTime: '60-120 business days',
          estimatedCost: 'Rs. 1,00,000 - Rs. 5,00,000',
          validity: '1-3 years',
          officialRef: 'Schedule M of Drugs and Cosmetics Rules, 1945',
          priority: 'critical'
        }
      ],
      'Food & Beverage Processing': [
        {
          type: 'fssai_central_license',
          name: 'FSSAI Central/State License',
          shortName: 'FSSAI',
          icon: '🍽️',
          description: 'FSSAI license for food manufacturing and processing operations. Central license required for turnover above Rs. 20 Crore or for export.',
          whyNeeded: 'Mandatory for all food business operators. Manufacturing without FSSAI license attracts up to Rs. 5 Lakh fine and 6 months imprisonment.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Food safety management plan',
            'Manufacturing process flow',
            'Product specifications and labeling',
            'Water testing report',
            'Waste management plan',
            'NOC from local authority'
          ],
          process: [
            'Apply online at fssai.gov.in',
            'Submit manufacturing details and documents',
            'FSSAI officer inspects facility',
            'Implement corrective actions if needed',
            'Receive FSSAI manufacturing license',
            'Get product approval for novel foods'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 75,000 per year',
          validity: '1-5 years',
          officialRef: 'Food Safety and Standards Act, 2006',
          priority: 'critical'
        },
        {
          type: 'haccp_certification',
          name: 'HACCP/ISO 22000 Certification',
          shortName: 'HACCP',
          icon: '🔬',
          description: 'Hazard Analysis Critical Control Points certification for food safety management.',
          whyNeeded: 'Required for food export and increasingly demanded by domestic retailers. Demonstrates systematic food safety control.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'HACCP plan documentation',
            ' hazard analysis records',
            'Critical control points identification',
            'Monitoring procedures',
            'Corrective action procedures',
            'Verification procedures'
          ],
          process: [
            'Develop and implement HACCP plan',
            'Conduct hazard analysis',
            'Identify critical control points',
            'Establish monitoring procedures',
            'Choose certification body',
            'Undergo HACCP audit and receive certificate'
          ],
          estimatedTime: '3-6 months',
          estimatedCost: 'Rs. 1,00,000 - Rs. 5,00,000',
          validity: '1-3 years',
          officialRef: 'Codex Alimentarius / ISO 22000:2018',
          priority: 'high'
        }
      ],
      'Chemicals & Petrochemicals': [
        {
          type: 'peso_license',
          name: 'PESO License (Petroleum/Explosives)',
          shortName: 'PESO',
          icon: '⚠️',
          description: 'Petroleum and Explosives Safety Organisation license for handling petroleum products, explosives, and compressed gases.',
          whyNeeded: 'Mandatory for any manufacturing unit handling petroleum, LPG, explosives, or compressed gases. Non-compliance can lead to imprisonment up to 7 years.',
          portal: { name: 'PESO Portal', url: 'https://www.petroleumandsafety.gov.in' },
          documentsRequired: [
            'Factory license',
            'Approved building plan',
            'Storage layout plan',
            'Safety data sheets for all chemicals',
            'Fire safety certificate',
            'Emergency response plan',
            'Worker safety training certificates'
          ],
          process: [
            'Apply to PESO for license',
            'Submit storage and safety details',
            'PESO officer inspects premises',
            'Install safety equipment as required',
            'Receive PESO license',
            'Comply with periodic renewal conditions'
          ],
          estimatedTime: '30-90 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 1,00,000',
          validity: '1-3 years',
          officialRef: 'Petroleum Act, 1934 / Explosives Act, 1884',
          priority: 'critical'
        },
        {
          type: 'eia_clearance',
          name: 'Environmental Impact Assessment (EIA)',
          shortName: 'EIA',
          icon: '🌍',
          description: 'Environmental clearance from MoEF&CC (Ministry of Environment, Forest and Climate Change) for red/orange category industries.',
          whyNeeded: 'Mandatory for projects listed in the EIA Notification. Operating without EIA clearance attracts Rs. 50 Lakh fine and plant closure.',
          portal: { name: 'MoEF&CC Portal', url: 'https://moef.gov.in' },
          documentsRequired: [
            'Project report with technical details',
            'Environmental baseline data',
            'Environmental management plan',
            'Public hearing records',
            'Risk assessment report',
            'Waste management plan'
          ],
          process: [
            'Determine if project requires EIA',
            'Conduct baseline environmental studies',
            'Prepare EIA report',
            'Conduct public hearing',
            'Submit EIA report to MoEF&CC',
            'Expert Appraisal Committee reviews',
            'Receive environmental clearance'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 5,00,000 - Rs. 25,00,000',
          validity: 'Until project completion',
          officialRef: 'EIA Notification, 2006',
          priority: 'critical'
        }
      ],
      'Electronics & IT Hardware': [
        {
          type: 'bis_crs_registration',
          name: 'BIS Compulsory Registration',
          shortName: 'BIS CRS',
          icon: '✅',
          description: 'Bureau of Indian Standards Compulsory Registration for electronics and IT products under the Electronics and IT Goods (Requirements for Compulsory Registration) Order.',
          whyNeeded: 'Mandatory for manufacturing or importing electronics products listed under CRS. Selling without BIS registration attracts Rs. 2 Lakh - Rs. 50 Lakh fine.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Product test reports from BIS-recognized lab',
            'Manufacturing process details',
            'Quality management system documents',
            'Product specifications and labeling',
            'Factory address proof'
          ],
          process: [
            'Get product tested at BIS-recognized lab',
            'Apply online at BIS portal',
            'Submit test reports and manufacturing details',
            'BIS reviews application',
            'Receive BIS CRS registration',
            'Mark products with BIS/CRS marking'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 1,00,000 per product',
          validity: '2 years (renewable)',
          officialRef: 'BIS Act, 2016 / Electronics and IT Goods Order',
          priority: 'critical'
        },
        {
          type: 'ewaste_authorization',
          name: 'E-Waste Management Authorization',
          shortName: 'E-Waste',
          icon: '♻️',
          description: 'Authorization under E-Waste (Management) Rules, 2016 for producers and manufacturers of electronics.',
          whyNeeded: 'Mandatory for electronics manufacturers under Extended Producer Responsibility (EPR). Must manage end-of-life products.',
          portal: { name: 'CPCB Portal', url: 'https://cpcb.nic.in' },
          documentsRequired: [
            'Company registration certificate',
            'Product list and quantities',
            'E-waste management plan',
            'Recycler tie-up agreements',
            'Annual return format',
            'Awareness program details'
          ],
          process: [
            'Apply to CPCB for EPR authorization',
            'Submit e-waste management plan',
            'Tie up with authorized recyclers',
            'CPCB reviews and grants authorization',
            'File annual returns on e-waste managed',
            'Comply with collection targets'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 50,000',
          validity: '5 years',
          officialRef: 'E-Waste (Management) Rules, 2016',
          priority: 'high'
        }
      ],
      'Textiles & Garments': [
        {
          type: 'fire_safety_noc',
          name: 'Fire Safety NOC',
          shortName: 'Fire NOC',
          icon: '🔥',
          description: 'No Objection Certificate from Fire Department for garment and textile manufacturing units.',
          whyNeeded: 'Textile factories with large volumes of flammable materials (fabric, yarn, dyes) require fire safety clearance. Mandatory under Factories Act and state fire services rules.',
          portal: { name: 'State Fire Department', url: '' },
          documentsRequired: [
            'Factory license',
            'Building plan with fire escape routes',
            'Fire fighting equipment installation certificates',
            'Electrical installation certificate',
            'NOC from local municipal authority',
            'Emergency evacuation plan'
          ],
          process: [
            'Install fire fighting equipment as per norms',
            'Prepare fire escape routes and emergency plans',
            'Apply to Fire Department for inspection',
            'Fire officer inspects premises',
            'Address any observations',
            'Receive Fire Safety NOC'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 50,000',
          validity: '1 year',
          officialRef: 'Factories Act, 1948 / State Fire Services Act',
          priority: 'critical'
        },
        {
          type: 'etp_compliance',
          name: 'Effluent Treatment Plant (ETP)',
          shortName: 'ETP',
          icon: '💧',
          description: 'Setting up and operating an Effluent Treatment Plant for dyeing and wet processing units.',
          whyNeeded: 'Mandatory for textile units engaged in dyeing, printing, and wet processing. Treated water must meet CPCB discharge standards.',
          portal: { name: 'SPCB Portal', url: '' },
          documentsRequired: [
            'ETP design and capacity details',
            'Consent to Establish from SPCB',
            'Consent to Operate from SPCB',
            'Water testing reports',
            'Sludge management plan',
            'Monitoring records'
          ],
          process: [
            'Design ETP based on effluent characteristics',
            'Apply for Consent to Establish from SPCB',
            'Install ETP and commission',
            'Conduct trial runs and optimize',
            'Apply for Consent to Operate',
            'Regular monitoring and compliance'
          ],
          estimatedTime: '3-6 months',
          estimatedCost: 'Rs. 10,00,000 - Rs. 50,00,000 (depending on capacity)',
          validity: '5 years',
          officialRef: 'Water (Prevention and Control of Pollution) Act, 1974',
          priority: 'critical'
        },
        {
          type: 'social_compliance_audit',
          name: 'Social Compliance Audit (SA8000/SEDEX)',
          shortName: 'Social Audit',
          icon: '👥',
          description: 'Social accountability certification for garment manufacturing units.',
          whyNeeded: 'Required by international buyers and retailers for export orders. Demonstrates ethical labor practices and working conditions.',
          portal: { name: 'SAI Portal', url: 'https://www.sa-intl.org' },
          documentsRequired: [
            'Worker employment contracts',
            'Payroll records',
            'Working hours records',
            'Health and safety documentation',
            'Child labor policy',
            'Freedom of association policy',
            'Grievance mechanism records'
          ],
          process: [
            'Implement SA8000 or SEDEX requirements',
            'Prepare documentation and records',
            'Choose accredited audit firm',
            'Conduct internal audit',
            'Undergo certification audit',
            'Address non-conformities and receive certificate'
          ],
          estimatedTime: '2-4 months',
          estimatedCost: 'Rs. 2,00,000 - Rs. 10,00,000',
          validity: '3 years (annual surveillance)',
          officialRef: 'SA8000 Standard / SEDEX Members Ethical Trade Audit',
          priority: 'medium'
        }
      ],
      'Metals, Steel & Foundries': [
        {
          type: 'bis_steel_certification',
          name: 'BIS Certification for Steel Products',
          shortName: 'BIS Steel',
          icon: '🔩',
          description: 'Bureau of Indian Standards certification for steel and metal products.',
          whyNeeded: 'Mandatory for manufacturing steel products under Quality Control Orders. Selling non-BIS certified steel products is an offence.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Product test reports from BIS-recognized lab',
            'Manufacturing process details',
            'Quality management system documents',
            'Factory address proof',
            'Product specifications'
          ],
          process: [
            'Get product tested at BIS-recognized lab',
            'Apply online at BIS portal',
            'Submit test reports and manufacturing details',
            'BIS conducts factory inspection',
            'Address observations',
            'Receive BIS certification mark license'
          ],
          estimatedTime: '30-90 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 1,00,000 per product',
          validity: '1-2 years (renewable)',
          officialRef: 'BIS Act, 2016 / Steel Quality Control Orders',
          priority: 'critical'
        },
        {
          type: 'zld_compliance',
          name: 'Zero Liquid Discharge (ZLD)',
          shortName: 'ZLD',
          icon: '♻️',
          description: 'Implementation of Zero Liquid Discharge system for steel plant effluents.',
          whyNeeded: 'Mandatory for steel plants in many states to prevent water pollution. Ensures no liquid waste is discharged into the environment.',
          portal: { name: 'SPCB Portal', url: '' },
          documentsRequired: [
            'ZLD system design',
            'Consent to Establish/Operate',
            'Water balance report',
            'Effluent characterization report',
            'Evaporation system specifications',
            'Sludge management plan'
          ],
          process: [
            'Design ZLD system based on effluent characteristics',
            'Apply for consent from SPCB',
            'Install ZLD equipment',
            'Commission and optimize system',
            'Monitor water recovery rates',
            'Regular compliance reporting'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 50,00,000 - Rs. 2,00,00,000',
          validity: '5 years',
          officialRef: 'Water Act, 1974 / State Pollution Control Board norms',
          priority: 'high'
        }
      ],
      'Cement & Building Materials': [
        {
          type: 'eia_clearance_cement',
          name: 'EIA Clearance (MoEF&CC)',
          shortName: 'EIA',
          icon: '🌍',
          description: 'Environmental clearance from Ministry of Environment, Forest and Climate Change for cement plants.',
          whyNeeded: 'Mandatory for cement plants as they are classified under Red category industry. Operating without EIA attracts Rs. 50 Lakh fine.',
          portal: { name: 'MoEF&CC Portal', url: 'https://moef.gov.in' },
          documentsRequired: [
            'Project report with capacity details',
            'Environmental baseline data',
            'Environmental management plan',
            'Public hearing records',
            'Risk assessment report',
            'Waste management plan',
            'Stack emission control plan'
          ],
          process: [
            'Conduct baseline environmental studies',
            'Prepare EIA report',
            'Conduct public hearing',
            'Submit EIA report to MoEF&CC',
            'Expert Appraisal Committee reviews',
            'Receive environmental clearance'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 10,00,000 - Rs. 50,00,000',
          validity: 'Until project completion',
          officialRef: 'EIA Notification, 2006',
          priority: 'critical'
        },
        {
          type: 'bis_cement_certification',
          name: 'BIS Certification for Cement',
          shortName: 'BIS Cement',
          icon: '🏗️',
          description: 'Bureau of Indian Standards certification for cement products (IS 269, IS 455, IS 12269).',
          whyNeeded: 'Mandatory for manufacturing and selling cement in India. Non-BIS cement cannot be legally sold.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Cement test reports from BIS-recognized lab',
            'Manufacturing process details',
            'Quality control laboratory details',
            'Raw material sources',
            'Factory layout plan'
          ],
          process: [
            'Get cement tested at BIS-recognized lab',
            'Apply online at BIS portal',
            'Submit test reports and factory details',
            'BIS conducts factory inspection',
            'Receive BIS certification mark license',
            'Mark cement bags with ISI mark'
          ],
          estimatedTime: '60-90 business days',
          estimatedCost: 'Rs. 50,000 - Rs. 2,00,000',
          validity: '1-2 years (renewable)',
          officialRef: 'BIS Act, 2016 / Cement Quality Control Order',
          priority: 'critical'
        }
      ],
      'Plastics & Rubber': [
        {
          type: 'epr_plastic_registration',
          name: 'EPR Registration (Plastic Waste)',
          shortName: 'EPR',
          icon: '♻️',
          description: 'Extended Producer Responsibility authorization under Plastic Waste Management Rules.',
          whyNeeded: 'Mandatory for producers and brand owners of plastic packaging. Must ensure collection and recycling of plastic waste.',
          portal: { name: 'CPCB Portal', url: 'https://cpcb.nic.in' },
          documentsRequired: [
            'Company registration certificate',
            'Product list with plastic packaging details',
            'Plastic waste management plan',
            'Recycler tie-up agreements',
            'Annual return format',
            'Awareness program details'
          ],
          process: [
            'Apply to CPCB for EPR authorization',
            'Submit waste management plan',
            'Tie up with authorized recyclers',
            'CPCB reviews and grants authorization',
            'File annual returns on plastic waste',
            'Comply with collection targets'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 50,000',
          validity: '5 years',
          officialRef: 'Plastic Waste Management Rules, 2016',
          priority: 'critical'
        },
        {
          type: 'bis_plastic_products',
          name: 'BIS for Plastic Products',
          shortName: 'BIS Plastic',
          icon: '📦',
          description: 'Bureau of Indian Standards certification for plastic packaging and products.',
          whyNeeded: 'Required for specific plastic products under Quality Control Orders. Ensures product quality and safety.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Product test reports',
            'Manufacturing process details',
            'Raw material specifications',
            'Quality control records',
            'Factory address proof'
          ],
          process: [
            'Get product tested at BIS-recognized lab',
            'Apply online at BIS portal',
            'Submit test reports and details',
            'BIS conducts factory inspection',
            'Receive BIS certification mark license'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 1,00,000 per product',
          validity: '1-2 years (renewable)',
          officialRef: 'BIS Act, 2016',
          priority: 'medium'
        }
      ],
      'Paper & Printing': [
        {
          type: 'effluent_discharge_paper',
          name: 'Effluent Discharge Compliance',
          shortName: 'Effluent',
          icon: '💧',
          description: 'Compliance with CPCB standards for paper mill effluents.',
          whyNeeded: 'Paper mills generate significant liquid waste. Must treat effluents before discharge as per Water Act provisions.',
          portal: { name: 'SPCB Portal', url: '' },
          documentsRequired: [
            'Consent to Establish from SPCB',
            'Consent to Operate from SPCB',
            'ETP design details',
            'Water testing reports',
            'Monitoring records',
            'Sludge management plan'
          ],
          process: [
            'Install ETP as per SPCB guidelines',
            'Apply for Consent to Establish',
            'Commission ETP and optimize',
            'Apply for Consent to Operate',
            'Regular monitoring and reporting'
          ],
          estimatedTime: '3-6 months',
          estimatedCost: 'Rs. 5,00,000 - Rs. 25,00,000',
          validity: '5 years',
          officialRef: 'Water (Prevention and Control of Pollution) Act, 1974',
          priority: 'high'
        },
        {
          type: 'boiler_consent',
          name: 'Boiler Consent (CPCB)',
          shortName: 'Boiler',
          icon: '♨️',
          description: 'CPCB consent for boiler operations in paper and printing units.',
          whyNeeded: 'Boilers used for steam generation require consent from pollution control boards. Operating without consent is an offence.',
          portal: { name: 'CPCB Portal', url: 'https://cpcb.nic.in' },
          documentsRequired: [
            'Boiler registration certificate',
            'Stack emission details',
            'Fuel type and consumption details',
            'Air pollution control equipment details',
            'Consent application form'
          ],
          process: [
            'Register boiler with Chief Inspector of Boilers',
            'Install air pollution control equipment',
            'Apply for consent from CPCB/SPCB',
            'Inspection by pollution control officer',
            'Receive consent to operate boiler'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 50,000',
          validity: '1 year',
          officialRef: 'Air (Prevention and Control of Pollution) Act, 1981',
          priority: 'high'
        }
      ],
      'Engineering & Machinery': [
        {
          type: 'bis_industrial_machinery',
          name: 'BIS for Industrial Machinery',
          shortName: 'BIS Machinery',
          icon: '⚙️',
          description: 'Bureau of Indian Standards certification for industrial machinery products.',
          whyNeeded: 'Required for specific industrial machinery under Quality Control Orders. Ensures safety and quality standards.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Product test reports',
            'Manufacturing process details',
            'Safety testing certificates',
            'Quality management system documents',
            'Factory address proof'
          ],
          process: [
            'Get machinery tested at BIS-recognized lab',
            'Apply online at BIS portal',
            'Submit test reports and details',
            'BIS conducts factory inspection',
            'Receive BIS certification mark license'
          ],
          estimatedTime: '30-90 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 1,00,000 per product',
          validity: '1-2 years (renewable)',
          officialRef: 'BIS Act, 2016',
          priority: 'medium'
        },
        {
          type: 'crane_inspection',
          name: 'Crane/Lifting Equipment Inspection',
          shortName: 'Lifting Equipment',
          icon: '🏗️',
          description: 'Annual inspection of cranes and lifting equipment under Factories Act.',
          whyNeeded: 'Mandatory for all cranes and lifting appliances to ensure worker safety. Must be inspected by competent authority.',
          portal: { name: 'Factory Inspectorate', url: '' },
          documentsRequired: [
            'Crane registration certificate',
            'Previous inspection reports',
            'Maintenance records',
            'Operator competency certificates',
            'Load test certificates',
            'Safety device calibration records'
          ],
          process: [
            'Schedule annual inspection with authorized agency',
            'Prepare equipment for inspection',
            'Inspection by competent authority',
            'Address any defects or observations',
            'Receive inspection certificate',
            'Display certificate at workplace'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 25,000 per equipment',
          validity: '1 year',
          officialRef: 'Factories Act, 1948 - Section 29',
          priority: 'high'
        }
      ],
      'Defense & Aerospace': [
        {
          type: 'industrial_license_defense',
          name: 'Industrial License (MoCI)',
          shortName: 'Defense License',
          icon: '🛡️',
          description: 'Industrial license from Ministry of Commerce and Industry for defense item manufacturing.',
          whyNeeded: 'Mandatory for manufacturing defense equipment and components. Operating without license is a serious offence.',
          portal: { name: 'DGFT Portal', url: 'https://www.dgft.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Director details and security clearance',
            'Manufacturing facility details',
            'Product list for defense items',
            'Technical capability documents',
            'Financial capacity documents'
          ],
          process: [
            'Apply to MoCI via DGFT portal',
            'Submit application with required documents',
            'Security clearance by Ministry of Defense',
            'Inter-ministerial committee reviews',
            'Receive industrial license',
            'Comply with license conditions'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 5,00,000 - Rs. 25,00,000',
          validity: 'As specified in license',
          officialRef: 'Industries (Development and Regulation) Act, 1951',
          priority: 'critical'
        },
        {
          type: 'as9100_certification',
          name: 'AS9100 Certification',
          shortName: 'AS9100',
          icon: '✈️',
          description: 'Aerospace quality management system certification for defense and aerospace manufacturers.',
          whyNeeded: 'Required by most defense and aerospace OEMs. Demonstrates quality management standards specific to aerospace.',
          portal: { name: 'SAE International', url: 'https://www.sae.org' },
          documentsRequired: [
            'ISO 9001 certificate',
            'Quality manual and procedures',
            'Aerospace-specific procedures',
            'Internal audit records',
            'Management review minutes',
            'Product conformity procedures'
          ],
          process: [
            'Implement AS9100 requirements',
            'Conduct internal audit',
            'Choose accredited certification body',
            'Stage 1 audit (documentation)',
            'Stage 2 audit (implementation)',
            'Receive AS9100 certificate'
          ],
          estimatedTime: '6-12 months',
          estimatedCost: 'Rs. 3,00,000 - Rs. 15,00,000',
          validity: '3 years (annual surveillance)',
          officialRef: 'SAE AS9100 Rev D',
          priority: 'high'
        }
      ],
      'FMCG (Fast Moving Consumer Goods)': [
        {
          type: 'fssai_fmcg',
          name: 'FSSAI License (Food FMCG)',
          shortName: 'FSSAI',
          icon: '🍽️',
          description: 'FSSAI license for FMCG products that are food items.',
          whyNeeded: 'Mandatory for all food FMCG products. Ensures food safety and quality standards.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Food safety management plan',
            'Product specifications',
            'Labeling details',
            'Manufacturing process flow',
            'Testing laboratory details'
          ],
          process: [
            'Apply online at fssai.gov.in',
            'Submit product and manufacturing details',
            'FSSAI officer inspects facility',
            'Receive FSSAI license',
            'Comply with labeling requirements'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 75,000 per year',
          validity: '1-5 years',
          officialRef: 'Food Safety and Standards Act, 2006',
          priority: 'critical'
        },
        {
          type: 'bis_fmcg_products',
          name: 'BIS Standards Compliance',
          shortName: 'BIS',
          icon: '✅',
          description: 'Bureau of Indian Standards compliance for consumer FMCG products.',
          whyNeeded: 'Required for specific FMCG products under Quality Control Orders. Ensures product quality and safety.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Product test reports',
            'Manufacturing process details',
            'Quality control records',
            'Labeling samples',
            'Factory address proof'
          ],
          process: [
            'Get product tested at BIS-recognized lab',
            'Apply online at BIS portal',
            'Submit test reports and details',
            'BIS conducts factory inspection',
            'Receive BIS certification mark license'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 1,00,000 per product',
          validity: '1-2 years (renewable)',
          officialRef: 'BIS Act, 2016',
          priority: 'medium'
        }
      ],
      'Furniture & Wood Products': [
        {
          type: 'fsc_certification',
          name: 'FSC Certification',
          shortName: 'FSC',
          icon: '🌲',
          description: 'Forest Stewardship Council certification for wood and furniture products.',
          whyNeeded: 'Required for exporting wood products to many countries. Demonstrates sustainable sourcing of wood.',
          portal: { name: 'FSC Portal', url: 'https://fsc.org' },
          documentsRequired: [
            'Chain of custody documentation',
            'Wood sourcing records',
            'Supplier audit reports',
            'Product tracking system',
            'Environmental policy',
            'Social compliance records'
          ],
          process: [
            'Implement FSC chain of custody',
            'Choose FSC-accredited certification body',
            'Submit application and documentation',
            'Initial audit by certification body',
            'Address non-conformities',
            'Receive FSC certificate'
          ],
          estimatedTime: '2-4 months',
          estimatedCost: 'Rs. 1,00,000 - Rs. 5,00,000',
          validity: '5 years (annual surveillance)',
          officialRef: 'FSC Principles and Criteria',
          priority: 'medium'
        },
        {
          type: 'voc_emission_control',
          name: 'VOC Emission Control',
          shortName: 'VOC',
          icon: '🌫️',
          description: 'Control of Volatile Organic Compound emissions from wood treatment and coating operations.',
          whyNeeded: 'Mandatory for furniture manufacturing units using paints, solvents, and wood treatment chemicals. Regulated under Air Act.',
          portal: { name: 'SPCB Portal', url: '' },
          documentsRequired: [
            'VOC emission inventory',
            'Air pollution control equipment details',
            'Consent to Establish/Operate',
            'Monitoring records',
            'Paint/solvent usage records',
            'Worker safety records'
          ],
          process: [
            'Install VOC capture/control equipment',
            'Apply for consent from SPCB',
            'Implement emission monitoring',
            'Regular testing and reporting',
            'Maintain compliance records'
          ],
          estimatedTime: '1-3 months',
          estimatedCost: 'Rs. 2,00,000 - Rs. 10,00,000',
          validity: '5 years',
          officialRef: 'Air (Prevention and Control of Pollution) Act, 1981',
          priority: 'medium'
        }
      ],
      'Shipbuilding & Repair': [
        {
          type: 'classification_approval',
          name: 'Classification Society Approval',
          shortName: 'Class Approval',
          icon: '🚢',
          description: 'Approval from a classification society (IRS, DNV, Lloyd\'s, ABS) for shipbuilding and repair.',
          whyNeeded: 'Mandatory for building or repairing ships. Classification ensures vessel safety and seaworthiness.',
          portal: { name: 'IRS Portal', url: 'https://www.irsltd.in' },
          documentsRequired: [
            'Ship design and construction drawings',
            'Material certificates',
            'Welding procedure specifications',
            'Quality management system documents',
            'Yard infrastructure details',
            'Personnel qualification records'
          ],
          process: [
            'Apply to classification society',
            'Submit design and construction drawings',
            'Get material and welding procedures approved',
            'Undergo yard audit',
            'Receive design approval',
            'Construction stage inspections',
            'Receive class certificate'
          ],
          estimatedTime: '3-6 months',
          estimatedCost: 'Rs. 5,00,000 - Rs. 25,00,000',
          validity: '5 years (annual surveys)',
          officialRef: 'Indian Register of Shipping (IRS) Rules',
          priority: 'critical'
        },
        {
          type: 'marpol_compliance',
          name: 'MARPOL Compliance',
          shortName: 'MARPOL',
          icon: '🌊',
          description: 'Compliance with International Convention for the Prevention of Pollution from Ships (MARPOL).',
          whyNeeded: 'Mandatory for all ships and shipyards. Prevents pollution from oil, chemicals, garbage, and sewage.',
          portal: { name: 'Directorate General of Shipping', url: 'https://dgs SHIPPING.gov.in' },
          documentsRequired: [
            'MARPOL certificate',
            'Oil Record Book',
            'International Oil Pollution Prevention Certificate',
            'Sewage treatment plant details',
            'Garbage management plan'
          ],
          process: [
            'Implement MARPOL requirements',
            'Install pollution prevention equipment',
            'Get certificates from classification society',
            'Maintain record books',
            'Undergo annual surveys'
          ],
          estimatedTime: '1-3 months',
          estimatedCost: 'Rs. 10,00,000 - Rs. 50,00,000 (equipment + certification)',
          validity: '5 years',
          officialRef: 'MARPOL Convention',
          priority: 'critical'
        },
        {
          type: 'solas_compliance',
          name: 'SOLAS Compliance',
          shortName: 'SOLAS',
          icon: '⚓',
          description: 'Compliance with International Convention for the Safety of Life at Sea (SOLAS).',
          whyNeeded: 'Mandatory for all commercial vessels. Ensures ship safety equipment and construction standards.',
          portal: { name: 'Directorate General of Shipping', url: 'https://dgshipping.gov.in' },
          documentsRequired: [
            'SOLAS certificate',
            'Safety equipment certificates',
            'Fire safety certificates',
            'Life-saving appliance certificates',
            'Navigation equipment certificates'
          ],
          process: [
            'Implement SOLAS requirements',
            'Install required safety equipment',
            'Get certificates from classification society',
            'Conduct safety drills',
            'Undergo annual surveys'
          ],
          estimatedTime: '1-3 months',
          estimatedCost: 'Rs. 20,00,000 - Rs. 1,00,00,000 (equipment + certification)',
          validity: '5 years',
          officialRef: 'SOLAS Convention',
          priority: 'critical'
        }
      ]
    }
  },

  trading: {
    common: [
      {
        type: 'gst_certificate',
        name: 'GST Registration Certificate',
        shortName: 'GST Certificate',
        icon: '📋',
        description: 'GST registration for trading business to collect and pay tax on goods bought and sold.',
        whyNeeded: 'Mandatory for traders with turnover exceeding Rs. 40 Lakh (Rs. 20 Lakh for NE states). Required for all B2B and B2C transactions.',
        portal: { name: 'GST Portal', url: 'https://www.gst.gov.in' },
        documentsRequired: [
          'PAN Card',
          'Aadhaar Card',
          'Business address proof',
          'Bank account statement',
          'Photograph',
          'Board resolution (for companies)'
        ],
        process: [
          'Apply online at gst.gov.in',
          'Upload required documents',
          'Complete Aadhaar authentication',
          'Receive ARN',
          'GST officer verifies',
          'Receive GSTIN'
        ],
        estimatedTime: '3-7 business days',
        estimatedCost: 'Free',
        validity: 'Permanent',
        officialRef: 'CGST Act, 2017 - Section 22',
        priority: 'critical'
      },
      {
        type: 'shop_establishment',
        name: 'Shop & Establishment License',
        shortName: 'Shop License',
        icon: '🏪',
        description: 'Registration under the respective State Shops and Establishments Act for all commercial establishments.',
        whyNeeded: 'Mandatory for every shop and commercial establishment. Regulates working hours, holidays, employment conditions, and worker rights.',
        portal: { name: 'State Labour Portal', url: 'https://labour.gov.in' },
        documentsRequired: [
          'ID proof of owner/director',
          'Rent agreement or property tax receipt',
          'NOC from property owner (if rented)',
          'Photograph of the shop',
          'Employee details',
          'Registration fee payment receipt'
        ],
        process: [
          'Apply online or offline to State Labour Department',
          'Submit required documents',
          'Pay registration fee',
          'Labour inspector may verify',
          'Receive Shop & Establishment License',
          'Display license at shop premises'
        ],
        estimatedTime: '7-15 business days',
        estimatedCost: 'Rs. 500 - Rs. 5,000',
        validity: '1-5 years (renewable)',
        officialRef: 'Shops and Establishments Act (State-specific)',
        priority: 'critical'
      },
      {
        type: 'pan_card',
        name: 'PAN Card',
        shortName: 'PAN',
        icon: '💳',
        description: 'Permanent Account Number for the business entity or proprietor.',
        whyNeeded: 'Mandatory for all financial transactions and tax compliance.',
        portal: { name: 'NSDL Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' },
        documentsRequired: [
          'Registration certificate',
          'Aadhaar Card'
        ],
        process: [
          'Apply online at NSDL/UTIITSL',
          'Upload required documents',
          'Pay application fee',
          'Receive PAN (instant e-PAN)',
          'Physical card in 15-20 days'
        ],
        estimatedTime: '15-20 business days (physical); Instant (e-PAN)',
        estimatedCost: 'Rs. 107',
        validity: 'Permanent',
        officialRef: 'Income Tax Act, 1961 - Section 139A',
        priority: 'critical'
      }
    ],
    industries: {
      'Pharmacy & Medical Store': [
        {
          type: 'drug_license_retail',
          name: 'Drug License (Retail)',
          shortName: 'Drug License',
          icon: '💊',
          description: 'Retail drug license from the State Drug Controller for selling medicines and pharmaceutical products.',
          whyNeeded: 'Mandatory for selling any drug or medicine. Operating without drug license is a criminal offence with imprisonment up to 3 years.',
          portal: { name: 'State Drug Controller Portal', url: 'https://cdsco.gov.in' },
          documentsRequired: [
            'Registered Pharmacist qualification certificates',
            'Premises layout and storage plan',
            'Refrigerator and cold storage details',
            'NOC from local authority',
            'Affidavit from pharmacist',
            'Proof of ownership or rent agreement'
          ],
          process: [
            'Apply to State Drug Controller',
            'Submit pharmacist and premises details',
            'Drug inspector inspects premises',
            'Ensure qualified pharmacist is available',
            'Receive Drug License',
            'Display license at pharmacy'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 3,000 - Rs. 15,000',
          validity: '1-5 years (renewable)',
          officialRef: 'Drugs and Cosmetics Act, 1940',
          priority: 'critical'
        },
        {
          type: 'gdp_certificate',
          name: 'Good Distribution Practices (GDP)',
          shortName: 'GDP',
          icon: '📦',
          description: 'Compliance with Good Distribution Practices for storage and distribution of medicines.',
          whyNeeded: 'Ensures medicines are stored and transported under proper conditions to maintain quality and safety.',
          portal: { name: 'CDSCO Portal', url: 'https://cdsco.gov.in' },
          documentsRequired: [
            'Temperature monitoring records',
            'Storage area layout',
            'Equipment qualification documents',
            'Staff training records',
            'SOPs for handling medicines',
            'Vehicle temperature records (for transport)'
          ],
          process: [
            'Implement GDP requirements',
            'Prepare SOPs for all distribution activities',
            'Install temperature monitoring systems',
            'Train staff on GDP requirements',
            'Self-assess against GDP standards',
            'Apply for GDP compliance certificate'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 1,00,000',
          validity: '1-3 years',
          officialRef: 'WHO GDP Guidelines / Schedule M',
          priority: 'high'
        }
      ],
      'E-Commerce & Online Trading': [
        {
          type: 'it_intermediary_compliance',
          name: 'IT Act Intermediary Guidelines Compliance',
          shortName: 'Intermediary Guidelines',
          icon: '🌐',
          description: 'Compliance with Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.',
          whyNeeded: 'Mandatory for all e-commerce platforms. Loss of intermediary immunity means direct liability for content on your platform.',
          portal: { name: 'MeitY Portal', url: 'https://www.meity.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Privacy policy and terms of service',
            'Grievance officer appointment letter',
            'Compliance framework document',
            'Data localization plan',
            'Content moderation policies'
          ],
          process: [
            'Appoint Grievance Officer based in India',
            'Publish privacy policy and terms of service',
            'Implement content moderation framework',
            'Enable traceability of first originator',
            'File compliance report with MeitY',
            'Conduct periodic audits'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 50,000 - Rs. 5,00,000',
          validity: 'Ongoing compliance required',
          officialRef: 'IT Act, 2000 + Intermediary Guidelines, 2021',
          priority: 'critical'
        },
        {
          type: 'consumer_protection_ecom',
          name: 'Consumer Protection (E-Commerce) Rules',
          shortName: 'E-Commerce Rules',
          icon: '🛒',
          description: 'Compliance with Consumer Protection (E-Commerce) Rules, 2020 for online marketplaces and inventory-based e-commerce.',
          whyNeeded: 'Mandatory for all e-commerce operators. Non-compliance attracts penalties up to Rs. 50 Lakh.',
          portal: { name: 'Consumer Affairs Portal', url: 'https://consumeraffairs.nic.in' },
          documentsRequired: [
            'Company registration certificate',
            'Consumer grievance redressal mechanism',
            'Product return and refund policies',
            'Display of country of origin for products',
            ' seller verification framework',
            'Annual compliance report'
          ],
          process: [
            'Implement consumer grievance redressal mechanism',
            'Publish return/refund/exchange policies',
            'Display all mandatory product information',
            'Verify all sellers on platform',
            'File annual compliance report',
            'Conduct periodic consumer awareness programs'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 25,000 - Rs. 2,00,000',
          validity: 'Ongoing compliance',
          officialRef: 'Consumer Protection Act, 2019 + E-Commerce Rules, 2020',
          priority: 'high'
        }
      ],
      'Import & Export Trading': [
        {
          type: 'iec_code',
          name: 'IEC (Importer Exporter Code)',
          shortName: 'IEC',
          icon: '🚢',
          description: 'Importer Exporter Code from DGFT (Directorate General of Foreign Trade) for import/export operations.',
          whyNeeded: 'Mandatory for any import or export of goods/services. Operating without IEC leads to goods seizure and penalties up to CIF value.',
          portal: { name: 'DGFT Portal', url: 'https://www.dgft.gov.in' },
          documentsRequired: [
            'PAN Card',
            'Cancelled cheque of business account',
            'Address proof of business',
            'Digital Signature Certificate (Class 2)'
          ],
          process: [
            'Apply online at DGFT portal',
            'Submit PAN and bank details',
            'Pay application fee',
            'DGFT processes application',
            'Receive IEC number',
            'Use IEC for all import/export transactions'
          ],
          estimatedTime: '1-3 business days',
          estimatedCost: 'Rs. 500',
          validity: 'Permanent (with biennial update)',
          officialRef: 'Foreign Trade (Development and Regulation) Act, 1992',
          priority: 'critical'
        },
        {
          type: 'customs_house_license',
          name: 'Customs House Agent License',
          shortName: 'CHA License',
          icon: '🏛️',
          description: 'Customs House Agent license for handling customs clearance of import/export goods.',
          whyNeeded: 'Required if you want to handle customs clearance yourself rather than through a third-party CHA.',
          portal: { name: 'CBIC Portal', url: 'https://www.cbic.gov.in' },
          documentsRequired: [
            'IEC code',
            'PAN and GST certificates',
            'Experience in customs clearance',
            'Infrastructure and IT systems details',
            'Bank guarantee',
            'Professional tax registration'
          ],
          process: [
            'Apply to Chief Commissioner of Customs',
            'Submit experience and infrastructure details',
            'Pay bank guarantee',
            'Customs authority reviews application',
            'Receive CHA license',
            'Comply with annual renewal conditions'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 50,000 - Rs. 2,00,000',
          validity: '1 year (renewable)',
          officialRef: 'Customs Act, 1962 - Section 146',
          priority: 'medium'
        }
      ],
      'Petroleum & Fuel Dealers': [
        {
          type: 'peso_dealer_license',
          name: 'PESO License for Petroleum Storage',
          shortName: 'PESO',
          icon: '⛽',
          description: 'Petroleum and Explosives Safety Organisation license for storage and sale of petroleum products.',
          whyNeeded: 'Mandatory for petroleum dealers. Operating without PESO license attracts imprisonment up to 5 years.',
          portal: { name: 'PESO Portal', url: 'https://www.petroleumandsafety.gov.in' },
          documentsRequired: [
            'Land ownership/lease documents',
            'Safety data sheets',
            'Fire safety certificate',
            'Storage tank specifications',
            'Dispensing equipment details',
            'Environmental clearance'
          ],
          process: [
            'Apply to PESO for dealer license',
            'Submit storage and safety details',
            'PESO officer inspects premises',
            'Install safety equipment',
            'Receive PESO license',
            'Comply with periodic inspections'
          ],
          estimatedTime: '30-60 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 1,00,000',
          validity: '1-3 years',
          officialRef: 'Petroleum Act, 1934',
          priority: 'critical'
        }
      ],
      'Jewellery & Accessories': [
        {
          type: 'hallmarking_license',
          name: 'BIS Hallmarking License',
          shortName: 'Hallmarking',
          icon: '💎',
          description: 'Bureau of Indian Standards hallmarking license for gold and silver jewellery.',
          whyNeeded: 'Mandatory for all gold jewellery sold in India under the hallmarking scheme. Selling unhallmarked jewellery attracts penalties.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'BIS certification for hallmarking centre',
            'Assaying and hallmarking laboratory details',
            'Quality management system documents',
            'Equipment calibration certificates',
            'Staff qualification certificates'
          ],
          process: [
            'Apply to BIS for hallmarking license',
            'Set up assaying and hallmarking centre',
            'Get laboratory accredited by NABL',
            'Submit application with test reports',
            'BIS inspects and verifies',
            'Receive hallmarking license'
          ],
          estimatedTime: '60-120 business days',
          estimatedCost: 'Rs. 1,00,000 - Rs. 5,00,000',
          validity: '3 years (renewable)',
          officialRef: 'BIS Act, 2016 + Hallmarking Scheme',
          priority: 'high'
        }
      ],
      'Agricultural Inputs (Seeds, Fertilizers)': [
        {
          type: 'insecticide_license',
          name: 'Insecticides Act License',
          shortName: 'Insecticide License',
          icon: '🌱',
          description: 'License under the Insecticides Act, 1968 for manufacturing, sale, and distribution of insecticides and pesticides.',
          whyNeeded: 'Mandatory for dealing in any insecticide, pesticide, or fungicide. Operating without license attracts imprisonment up to 2 years.',
          portal: { name: 'CIB&RC Portal', url: 'https://cibrc.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Qualification of technical staff',
            'Storage facility details',
            'Safety equipment details',
            'Pesticide formulations and labels',
            'Environmental clearance'
          ],
          process: [
            'Apply to Central Insecticides Board',
            'Submit technical staff qualifications',
            'Provide storage and safety details',
            'CIBRC reviews application',
            'Receive registration certificate',
            'Comply with labeling requirements'
          ],
          estimatedTime: '60-120 business days',
          estimatedCost: 'Rs. 10,000 - Rs. 1,00,000',
          validity: '1-5 years',
          officialRef: 'Insecticides Act, 1968',
          priority: 'critical'
        }
      ],
      'Retail (General Store / Kirana)': [
        {
          type: 'fssai_registration',
          name: 'FSSAI Registration (Food Items)',
          shortName: 'FSSAI',
          icon: '🍽️',
          description: 'Basic FSSAI registration for selling food items in retail stores.',
          whyNeeded: 'Mandatory for all food business operators. Required for selling packaged or loose food items.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'Aadhaar Card',
            'PAN Card',
            'Business address proof',
            'Photograph',
            'List of food products to be sold'
          ],
          process: [
            'Apply online at fssai.gov.in',
            'Upload required documents',
            'Pay registration fee',
            'Receive basic FSSAI registration',
            'Display registration at shop'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 100 - Rs. 1,000 per year',
          validity: '1-5 years',
          officialRef: 'Food Safety and Standards Act, 2006',
          priority: 'high'
        },
        {
          type: 'weights_measures',
          name: 'Weights & Measures Compliance',
          shortName: 'W&M',
          icon: '⚖️',
          description: 'Compliance with Legal Metrology Act for weighing and measuring instruments.',
          whyNeeded: 'All commercial weighing and measuring instruments must be verified and stamped by the Controller of Legal Metrology.',
          portal: { name: 'Legal Metrology Portal', url: '' },
          documentsRequired: [
            'Purchase invoice of weighing instrument',
            'Verification certificate from authorized repairer',
            'Registration fee payment receipt'
          ],
          process: [
            'Purchase BIS-certified weighing instrument',
            'Get instrument verified by authorized center',
            'Receive verification stamp',
            'Register instrument with Legal Metrology',
            'Display verification certificate'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 500 - Rs. 2,000 per instrument',
          validity: '1 year (annual re-verification)',
          officialRef: 'Legal Metrology Act, 2009',
          priority: 'medium'
        }
      ],
      'Grocery & Supermarket': [
        {
          type: 'fssai_state_license',
          name: 'FSSAI State/Central License',
          shortName: 'FSSAI',
          icon: '🛒',
          description: 'FSSAI State or Central license for grocery and supermarket operations.',
          whyNeeded: 'Mandatory for all grocery stores and supermarkets selling food items. Higher turnover requires Central license.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'Company registration certificate',
            'Food safety management plan',
            'List of food categories',
            'Cold storage details',
            'Pest control records',
            'Staff health certificates'
          ],
          process: [
            'Apply online at fssai.gov.in',
            'Submit facility details and documents',
            'FSSAI officer inspects premises',
            'Address observations if any',
            'Receive FSSAI license',
            'Display license at store'
          ],
          estimatedTime: '15-30 business days',
          estimatedCost: 'Rs. 5,000 - Rs. 75,000 per year',
          validity: '1-5 years',
          officialRef: 'Food Safety and Standards Act, 2006',
          priority: 'critical'
        },
        {
          type: 'pest_control_records',
          name: 'Pest Control Records',
          shortName: 'Pest Control',
          icon: '🐛',
          description: 'Maintaining pest control records for food storage areas in grocery stores.',
          whyNeeded: 'Required for food safety compliance. Regular pest control is essential for maintaining hygiene standards.',
          portal: { name: 'FSSAI Portal', url: 'https://www.fssai.gov.in' },
          documentsRequired: [
            'Pest control service contract',
            'Treatment schedule records',
            'Chemical usage records',
            'Inspection reports',
            'Corrective action records'
          ],
          process: [
            'Engage licensed pest control service',
            'Create pest control schedule',
            'Maintain treatment records',
            'Conduct regular inspections',
            'Address any pest issues promptly'
          ],
          estimatedTime: '1-2 weeks (setup)',
          estimatedCost: 'Rs. 5,000 - Rs. 25,000 per year',
          validity: 'Annual contract',
          officialRef: 'FSSAI Hygiene Regulations',
          priority: 'low'
        }
      ],
      'Electronics & Appliances': [
        {
          type: 'bis_electronics',
          name: 'BIS Compliance (Sold Products)',
          shortName: 'BIS',
          icon: '✅',
          description: 'Ensuring all sold electronics carry BIS/CRS marking as required.',
          whyNeeded: 'Retailers must only sell BIS-certified electronics. Selling non-certified products is an offence.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'BIS/CRS certificates from suppliers',
            'Product-wise BIS marking verification',
            'Supplier compliance declarations'
          ],
          process: [
            'Verify BIS certification of all products',
            'Obtain BIS certificates from suppliers',
            'Train staff on BIS marking requirements',
            'Implement product verification process',
            'Maintain records of certified products'
          ],
          estimatedTime: '1-2 weeks',
          estimatedCost: 'Rs. 0 (no direct cost, supplier responsibility)',
          validity: 'Ongoing',
          officialRef: 'BIS Act, 2016 / Electronics and IT Goods Order',
          priority: 'high'
        },
        {
          type: 'consumer_protection_warranty',
          name: 'Consumer Protection (Warranty)',
          shortName: 'Warranty',
          icon: '🛡️',
          description: 'Compliance with Consumer Protection Act warranty norms for electronics.',
          whyNeeded: 'Mandatory for all consumer electronics. Must honor warranty terms and maintain complaint records.',
          portal: { name: 'Consumer Protection Portal', url: 'https://consumeraffairs.nic.in' },
          documentsRequired: [
            'Warranty terms and conditions',
            'Consumer complaint register',
            'Service center details',
            'Spare parts availability records'
          ],
          process: [
            'Display warranty terms clearly',
            'Maintain consumer complaint register',
            'Honor warranty claims within timeline',
            'Provide replacement or repair as per terms',
            'File quarterly returns if required'
          ],
          estimatedTime: 'Ongoing compliance',
          estimatedCost: 'No direct cost',
          validity: 'As per product warranty',
          officialRef: 'Consumer Protection Act, 2019',
          priority: 'medium'
        },
        {
          type: 'e_collection_epr',
          name: 'E-Waste Collection Responsibility',
          shortName: 'E-Waste',
          icon: '♻️',
          description: 'Compliance with e-waste collection under Extended Producer Responsibility framework.',
          whyNeeded: 'Retailers selling electronics must facilitate e-waste collection from consumers.',
          portal: { name: 'CPCB Portal', url: 'https://cpcb.nic.in' },
          documentsRequired: [
            'EPR authorization from supplier',
            'E-waste collection center details',
            'Collection records',
            'Recycler tie-up agreements'
          ],
          process: [
            'Set up e-waste collection center',
            'Display e-waste awareness signage',
            'Collect e-waste from consumers',
            'Hand over to authorized recyclers',
            'File annual returns'
          ],
          estimatedTime: '1-2 weeks (setup)',
          estimatedCost: 'Rs. 10,000 - Rs. 50,000 (collection infrastructure)',
          validity: 'Ongoing',
          officialRef: 'E-Waste (Management) Rules, 2016',
          priority: 'medium'
        }
      ],
      'Clothing & Footwear': [
        {
          type: 'bis_textile_products',
          name: 'BIS for Textile Products',
          shortName: 'BIS',
          icon: '👔',
          description: 'Compliance with BIS standards for textile and footwear products.',
          whyNeeded: 'Required for specific textile products under Quality Control Orders. Ensures product quality and safety.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'Product test reports',
            'Supplier BIS certificates',
            'Product labeling compliance'
          ],
          process: [
            'Verify BIS certification of products',
            'Obtain certificates from suppliers',
            'Train staff on BIS requirements',
            'Implement product verification process'
          ],
          estimatedTime: '1-2 weeks',
          estimatedCost: 'Rs. 0 (supplier responsibility)',
          validity: 'Ongoing',
          officialRef: 'BIS Act, 2016',
          priority: 'low'
        }
      ],
      'Furniture & Home Décor': [
        {
          type: 'fsc_retail',
          name: 'FSC Certification (Wood Products)',
          shortName: 'FSC',
          icon: '🌲',
          description: 'Forest Stewardship Council certification for wood furniture and home décor products.',
          whyNeeded: 'Required for selling wood products to environmentally conscious markets. Demonstrates sustainable sourcing.',
          portal: { name: 'FSC Portal', url: 'https://fsc.org' },
          documentsRequired: [
            'FSC chain of custody certificate from supplier',
            'Product tracking documentation',
            'Sourcing records'
          ],
          process: [
            'Source products from FSC-certified suppliers',
            'Maintain chain of custody records',
            'Display FSC labels appropriately'
          ],
          estimatedTime: '1-2 weeks',
          estimatedCost: 'Rs. 0 (supplier responsibility)',
          validity: 'As per supplier certification',
          officialRef: 'FSC Principles and Criteria',
          priority: 'low'
        }
      ],
      'Building Materials & Hardware': [
        {
          type: 'bis_construction_materials',
          name: 'BIS for Construction Materials',
          shortName: 'BIS',
          icon: '🏗️',
          description: 'Ensuring building materials carry BIS certification.',
          whyNeeded: 'Mandatory for selling BIS-certified construction materials like cement, steel, pipes, etc.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'BIS certificates from suppliers',
            'Product-wise BIS marking verification',
            'Supplier compliance declarations'
          ],
          process: [
            'Verify BIS certification of all products',
            'Obtain BIS certificates from suppliers',
            'Train staff on BIS marking requirements',
            'Implement product verification process'
          ],
          estimatedTime: '1-2 weeks',
          estimatedCost: 'Rs. 0 (supplier responsibility)',
          validity: 'Ongoing',
          officialRef: 'BIS Act, 2016',
          priority: 'high'
        },
        {
          type: 'weights_measures_hardware',
          name: 'Weights & Measures Compliance',
          shortName: 'W&M',
          icon: '⚖️',
          description: 'Compliance with Legal Metrology Act for measuring instruments.',
          whyNeeded: 'Required for all commercial measuring instruments used in hardware stores.',
          portal: { name: 'Legal Metrology Portal', url: '' },
          documentsRequired: [
            'Purchase invoice of measuring instrument',
            'Verification certificate',
            'Registration fee payment receipt'
          ],
          process: [
            'Purchase certified measuring instruments',
            'Get instruments verified',
            'Register with Legal Metrology'
          ],
          estimatedTime: '7-15 business days',
          estimatedCost: 'Rs. 500 - Rs. 2,000 per instrument',
          validity: '1 year',
          officialRef: 'Legal Metrology Act, 2009',
          priority: 'medium'
        }
      ],
      'Auto Parts & Accessories': [
        {
          type: 'bis_auto_parts',
          name: 'BIS for Auto Components',
          shortName: 'BIS',
          icon: '🚗',
          description: 'Ensuring auto parts carry BIS certification where required.',
          whyNeeded: 'Mandatory for selling BIS-certified auto components under Quality Control Orders.',
          portal: { name: 'BIS Portal', url: 'https://www.bis.gov.in' },
          documentsRequired: [
            'BIS certificates from suppliers',
            'Product-wise verification records',
            'Supplier compliance declarations'
          ],
          process: [
            'Verify BIS certification of all products',
            'Obtain BIS certificates from suppliers',
            'Train staff on BIS requirements',
            'Implement product verification process'
          ],
          estimatedTime: '1-2 weeks',
          estimatedCost: 'Rs. 0 (supplier responsibility)',
          validity: 'Ongoing',
          officialRef: 'BIS Act, 2016',
          priority: 'medium'
        }
      ],
      'Wholesale / Distribution': [
        {
          type: 'tcs_collection',
          name: 'TCS Collection (Sec 206C)',
          shortName: 'TCS',
          icon: '💰',
          description: 'Tax Collection at Source on goods sale exceeding Rs. 50 lakh.',
          whyNeeded: 'Mandatory for wholesalers and distributors to collect TCS on sales exceeding Rs. 50 lakh.',
          portal: { name: 'Income Tax Portal', url: 'https://www.incometax.gov.in' },
          documentsRequired: [
            'PAN of buyers',
            'Sales invoices',
            'TCS collection records',
            'Challans for TCS deposit'
          ],
          process: [
            'Collect PAN from buyers',
            'Deduct TCS at applicable rate',
            'Deposit TCS by 7th of next month',
            'File quarterly TCS return',
            'Issue TCS certificate to buyers'
          ],
          estimatedTime: 'Ongoing monthly',
          estimatedCost: 'No direct cost',
          validity: 'Ongoing',
          officialRef: 'Income Tax Act, 1961 - Section 206C',
          priority: 'high'
        }
      ]
    }
  }
};

const SECTOR_LABELS = {
  service: 'Service',
  manufacturing: 'Manufacturing',
  trading: 'Trading'
};

const SECTOR_DESCRIPTIONS = {
  service: 'IT, BPO, Telecom, Consulting, Healthcare, Education, and other service businesses',
  manufacturing: 'Factories, Production units, Industrial operations, and Assembly plants',
  trading: 'Shops, Retail, Wholesale, E-Commerce, and Buy & Sell businesses'
};

module.exports = { ONBOARDING_DATA, SECTOR_LABELS, SECTOR_DESCRIPTIONS };
