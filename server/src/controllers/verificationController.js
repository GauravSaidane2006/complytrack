const Verification = require('../models/Verification');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { ONBOARDING_DATA } = require('../data/onboardingData');

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

    const maxSize = 10 * 1024 * 1024;
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

    const orgSector = organization.sector;
    const orgIndustry = organization.industry;
    const sectorData = ONBOARDING_DATA[orgSector] || {};
    const requiredDocs = [
      ...(sectorData.common || []),
      ...(sectorData.industries?.[orgIndustry] || [])
    ];
    const uploadedTypes = organization.documents.map(d => d.documentType);
    const allRequiredUploaded = requiredDocs
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
    const isDevUser = req.user.role === 'developer' || req.user.role === 'superadmin';
    const orgId = req.params.orgId || req.user.organization;
    
    if (!isDevUser && orgId !== req.user.organization.toString()) {
      return res.status(403).json({ message: 'Access denied to this organization.' });
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const verifications = await Verification.find({ organization: organization._id })
      .sort({ createdAt: -1 });

    const orgSector = organization.sector;
    const orgIndustry = organization.industry;
    const sectorData = ONBOARDING_DATA[orgSector] || {};
    const requiredDocs = [
      ...(sectorData.common || []),
      ...(sectorData.industries?.[orgIndustry] || [])
    ];
    const uploadedTypes = organization.documents.map(d => d.documentType);
    const missingDocs = requiredDocs.filter(d => !uploadedTypes.includes(d.type));

    res.json({
      verificationStatus: organization.verificationStatus,
      verifiedAt: organization.verifiedAt,
      documents: organization.documents,
      verifications,
      sector: organization.sector,
      industry: organization.industry,
      requiredDocuments: requiredDocs,
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
    if (!user.isDev && user.role !== 'developer' && user.email !== 'admin@complytrack.dev') {
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
    const sectorData = ONBOARDING_DATA[sector];

    if (!sectorData) {
      return res.status(400).json({ message: 'Invalid sector.' });
    }

    const docs = [
      ...(sectorData.common || []),
      ...Object.values(sectorData.industries || {}).flat()
    ];

    res.json({ sector, documents: docs });
  } catch (error) {
    next(error);
  }
};

exports.getHelpContent = async (req, res, next) => {
  try {
    const { sector } = req.params;
    const { industry } = req.query;

    const sectorData = ONBOARDING_DATA[sector];
    if (!sectorData) {
      return res.status(400).json({ message: 'Invalid sector.' });
    }

    const commonDocs = sectorData.common || [];
    const industryDocs = industry ? (sectorData.industries?.[industry] || []) : [];
    const allDocs = [...commonDocs, ...industryDocs];

    const steps = allDocs.map((doc, index) => ({
      step: index + 1,
      title: doc.name,
      description: doc.description,
      portal: doc.portal?.name || 'Government Portal',
      url: doc.portal?.url || '#',
      documents: doc.documentsRequired || [],
      estimatedTime: doc.estimatedTime,
      estimatedCost: doc.estimatedCost
    }));

    const faq = allDocs.slice(0, 5).map(doc => ({
      question: `What is ${doc.shortName || doc.name}?`,
      answer: doc.description
    }));

    const content = {
      title: `${doc.sectorLabel || sector} Sector - Document Requirements`,
      description: `Required documents for ${sector} sector businesses${industry ? ` in ${industry}` : ''}.`,
      steps,
      faq
    };

    res.json(content);
  } catch (error) {
    next(error);
  }
};
