const Verification = require('../models/Verification');
const Organization = require('../models/Organization');
const User = require('../models/User');

const SECTOR_DOCUMENTS = {
  service: [
    { type: 'company_registration', name: 'Company Registration Certificate', required: true, helpUrl: 'https://www.mca.gov.in', helpText: 'Register your company on MCA portal. Visit mca.gov.in and apply for incorporation under Companies Act, 2013.' },
    { type: 'gst_certificate', name: 'GST Certificate', required: true, helpUrl: 'https://www.gst.gov.in', helpText: 'Register for GST on gst.gov.in if your turnover exceeds Rs. 40 lakh (Rs. 20 lakh for services in special states).' },
    { type: 'pan_card', name: 'PAN Card', required: true, helpUrl: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', helpText: 'Apply for PAN at NSDL/UTIITSL. Company PAN is mandatory for all financial transactions.' }
  ],
  manufacturing: [
    { type: 'company_registration', name: 'Company Registration Certificate', required: true, helpUrl: 'https://www.mca.gov.in', helpText: 'Register your company on MCA portal. Visit mca.gov.in and apply for incorporation.' },
    { type: 'factory_license', name: 'Factory License', required: true, helpUrl: 'https://labour.gov.in', helpText: 'Apply for Factory License from your state Labour Department. Required under Factories Act, 1948 for premises with 10+ workers.' },
    { type: 'pollution_consent', name: 'Pollution Board Consent (CTO/CTE)', required: true, helpUrl: 'https://moef.gov.in', helpText: 'Obtain Consent to Establish (CTE) and Consent to Operate (CTO) from State Pollution Control Board (SPCB).' },
    { type: 'pan_card', name: 'PAN Card', required: true, helpUrl: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', helpText: 'Apply for Company PAN at NSDL/UTIITSL portal.' }
  ],
  trading: [
    { type: 'gst_certificate', name: 'GST Certificate', required: true, helpUrl: 'https://www.gst.gov.in', helpText: 'Register for GST on gst.gov.in. Mandatory for all businesses with turnover exceeding Rs. 40 lakh (Rs. 20 lakh for NE states).' },
    { type: 'shop_establishment', name: 'Shop & Establishment License', required: true, helpUrl: 'https://labour.gov.in', helpText: 'Register your shop under the respective State Shops & Establishments Act. Required for all commercial establishments.' },
    { type: 'pan_card', name: 'PAN Card', required: true, helpUrl: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', helpText: 'Apply for PAN at NSDL/UTIITSL. Required for all business and financial transactions.' }
  ]
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentType, sector } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select a document.' });
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }

    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const existingDoc = organization.documents.find(
      d => d.documentType === documentType && d.status !== 'rejected'
    );
    if (existingDoc) {
      return res.status(400).json({ message: 'This document type has already been uploaded. Rejected documents can be re-uploaded.' });
    }

    const verification = await Verification.create({
      organization: organization._id,
      documentType,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'pending',
      sector
    });

    organization.documents = organization.documents.filter(
      d => !(d.documentType === documentType && d.status === 'rejected')
    );

    organization.documents.push({
      documentType,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
      status: 'pending'
    });

    const requiredDocs = SECTOR_DOCUMENTS[sector] || [];
    const uploadedTypes = organization.documents.map(d => d.documentType);
    const allRequiredUploaded = requiredDocs
      .filter(d => d.required)
      .every(d => uploadedTypes.includes(d.type));

    if (allRequiredUploaded) {
      organization.verificationStatus = 'under_review';
    } else {
      organization.verificationStatus = 'documents_required';
    }

    await organization.save();

    res.status(201).json({
      message: 'Document uploaded successfully. Under review.',
      verification,
      organization: {
        verificationStatus: organization.verificationStatus,
        documents: organization.documents
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getVerificationStatus = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.orgId || req.user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const verifications = await Verification.find({ organization: organization._id })
      .sort({ createdAt: -1 });

    const sectorDocs = SECTOR_DOCUMENTS[organization.sector] || [];
    const uploadedTypes = organization.documents.map(d => d.documentType);
    const missingDocs = sectorDocs.filter(d => d.required && !uploadedTypes.includes(d.type));

    res.json({
      verificationStatus: organization.verificationStatus,
      verifiedAt: organization.verifiedAt,
      documents: organization.documents,
      verifications,
      sector: organization.sector,
      requiredDocuments: sectorDocs,
      missingDocuments: missingDocs
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewDocument = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    verification.status = status;
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    if (status === 'rejected') {
      verification.rejectionReason = rejectionReason;
    }
    await verification.save();

    const organization = await Organization.findById(verification.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const docIndex = organization.documents.findIndex(
      d => d.documentType === verification.documentType && d.status === 'pending'
    );
    if (docIndex !== -1) {
      organization.documents[docIndex].status = status;
      if (status === 'rejected') {
        organization.documents[docIndex].rejectionReason = rejectionReason;
      }
    }

    const allDocs = organization.documents;
    const hasRejected = allDocs.some(d => d.status === 'rejected');
    const allApproved = allDocs.length > 0 && allDocs.every(d => d.status === 'approved');

    if (hasRejected) {
      organization.verificationStatus = 'rejected';
    } else if (allApproved) {
      organization.verificationStatus = 'verified';
      organization.verifiedAt = new Date();
    } else {
      organization.verificationStatus = 'under_review';
    }

    await organization.save();

    res.json({
      message: `Document ${status} successfully.`,
      verification,
      organization: {
        verificationStatus: organization.verificationStatus,
        verifiedAt: organization.verifiedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.devBypass = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isDev && user.email !== 'admin@complytrack.dev') {
      return res.status(403).json({ message: 'DEV bypass not available for this account.' });
    }

    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    organization.verificationStatus = 'verified';
    organization.verifiedAt = new Date();
    await organization.save();

    res.json({
      message: 'DEV bypass successful. Account verified.',
      organization: {
        verificationStatus: organization.verificationStatus,
        verifiedAt: organization.verifiedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSectorHelp = async (req, res, next) => {
  try {
    const { sector } = req.params;
    const docs = SECTOR_DOCUMENTS[sector];

    if (!docs) {
      return res.status(400).json({ message: 'Invalid sector.' });
    }

    res.json({ sector, documents: docs });
  } catch (error) {
    next(error);
  }
};

exports.getHelpContent = async (req, res, next) => {
  try {
    const { sector } = req.params;

    const helpContent = {
      service: {
        title: 'Service Sector - Document Requirements',
        description: 'Required documents for IT, BPO, Telecom, and other service businesses.',
        steps: [
          {
            step: 1,
            title: 'Register Your Company',
            description: 'Register your company with Ministry of Corporate Affairs (MCA)',
            portal: 'MCA Portal',
            url: 'https://www.mca.gov.in',
            documents: ['Memorandum of Association', 'Articles of Association', 'Board Resolution'],
            estimatedTime: '3-5 business days'
          },
          {
            step: 2,
            title: 'Obtain GST Certificate',
            description: 'Register for Goods and Services Tax if turnover exceeds threshold',
            portal: 'GST Portal',
            url: 'https://www.gst.gov.in',
            documents: ['PAN Card', 'Aadhaar', 'Business address proof', 'Bank account statement'],
            estimatedTime: '3-7 business days'
          },
          {
            step: 3,
            title: 'Apply for PAN Card',
            description: 'Apply for company PAN from NSDL/UTIITSL',
            portal: 'NSDL Portal',
            url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
            documents: ['Company registration certificate', 'Board resolution'],
            estimatedTime: '15-20 business days'
          }
        ],
        faq: [
          { question: 'What if my company is not yet registered?', answer: 'You can apply for company registration first. Once registered, proceed with other documents.' },
          { question: 'Can I use personal PAN for company?', answer: 'No, you need a separate company PAN for business transactions.' },
          { question: 'How long does GST registration take?', answer: 'Typically 3-7 business days if all documents are in order.' }
        ]
      },
      manufacturing: {
        title: 'Manufacturing Sector - Document Requirements',
        description: 'Required documents for factories, production units, and industrial businesses.',
        steps: [
          {
            step: 1,
            title: 'Register Your Company',
            description: 'Register with MCA under Companies Act',
            portal: 'MCA Portal',
            url: 'https://www.mca.gov.in',
            documents: ['Memorandum of Association', 'Articles of Association'],
            estimatedTime: '3-5 business days'
          },
          {
            step: 2,
            title: 'Obtain Factory License',
            description: 'Apply from State Labour Department under Factories Act, 1948',
            portal: 'State Labour Portal',
            url: 'https://labour.gov.in',
            documents: ['Building plan', 'Site plan', 'Safety certificates', 'Employment details'],
            estimatedTime: '30-45 business days'
          },
          {
            step: 3,
            title: 'Get Pollution Board Consent',
            description: 'Obtain CTE and CTO from State Pollution Control Board',
            portal: 'SPCB Portal',
            url: 'https://moef.gov.in',
            documents: ['Environmental Impact Assessment', 'Process flow diagram', 'Waste management plan'],
            estimatedTime: '60-90 business days'
          },
          {
            step: 4,
            title: 'Apply for PAN Card',
            description: 'Company PAN from NSDL/UTIITSL',
            portal: 'NSDL Portal',
            url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
            documents: ['Company registration certificate'],
            estimatedTime: '15-20 business days'
          }
        ],
        faq: [
          { question: 'What is Factory License?', answer: 'Factory License is mandatory under Factories Act, 1948 for premises with 10+ workers using power, or 20+ without power.' },
          { question: 'What is CTE and CTO?', answer: 'Consent to Establish (CTE) is required before starting operations. Consent to Operate (CTO) is required for ongoing operations.' },
          { question: 'How long does pollution consent take?', answer: 'Typically 60-90 business days depending on the state and project type.' }
        ]
      },
      trading: {
        title: 'Trading Sector - Document Requirements',
        description: 'Required documents for shops, retail stores, wholesale businesses, and buying & selling establishments.',
        steps: [
          {
            step: 1,
            title: 'Register for GST',
            description: 'Obtain GST registration if your turnover exceeds the threshold limit',
            portal: 'GST Portal',
            url: 'https://www.gst.gov.in',
            documents: ['PAN Card', 'Aadhaar', 'Business address proof', 'Bank account statement', 'Photograph'],
            estimatedTime: '3-7 business days'
          },
          {
            step: 2,
            title: 'Obtain Shop & Establishment License',
            description: 'Register your shop under the State Shops & Establishments Act',
            portal: 'State Labour Portal',
            url: 'https://labour.gov.in',
            documents: ['ID proof of owner', 'Rent agreement / Property tax receipt', 'NOC from owner (if rented)', 'Photograph of the shop'],
            estimatedTime: '7-15 business days'
          },
          {
            step: 3,
            title: 'Apply for PAN Card',
            description: 'Company/Proprietorship PAN from NSDL/UTIITSL',
            portal: 'NSDL Portal',
            url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
            documents: ['Registration certificate', 'Aadhaar'],
            estimatedTime: '15-20 business days'
          }
        ],
        faq: [
          { question: 'When is GST registration required for traders?', answer: 'GST registration is mandatory when your aggregate turnover exceeds Rs. 40 lakh for goods (Rs. 20 lakh for NE states). Voluntary registration is also allowed for Input Tax Credit benefits.' },
          { question: 'Is Shop & Establishment License mandatory?', answer: 'Yes, every shop and commercial establishment must register under the respective State Shops & Establishments Act. This is a basic labor law compliance.' },
          { question: 'Can I use my personal PAN for business?', answer: 'For proprietorship firms, personal PAN can be used. For companies/LLPs, a separate PAN is required.' }
        ]
      }
    };

    const content = helpContent[sector];
    if (!content) {
      return res.status(400).json({ message: 'Invalid sector.' });
    }

    res.json(content);
  } catch (error) {
    next(error);
  }
};
