const Organization = require('../models/Organization');
const { ONBOARDING_DATA, SECTOR_LABELS, SECTOR_DESCRIPTIONS } = require('../data/onboardingData');

exports.getOnboardingRequirements = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const { sector, industry } = organization;
    if (!sector || !industry) {
      return res.status(400).json({ message: 'Sector and industry must be set on your organization.' });
    }

    const sectorData = ONBOARDING_DATA[sector];
    if (!sectorData) {
      return res.status(400).json({ message: 'Invalid sector.' });
    }

    const commonDocs = sectorData.common || [];
    const industryDocs = sectorData.industries?.[industry] || [];

    const uploadedTypes = (organization.documents || []).map(d => d.documentType);
    const uploadedMap = {};
    (organization.documents || []).forEach(d => {
      uploadedMap[d.documentType] = {
        status: d.status,
        uploadedAt: d.uploadedAt,
        rejectionReason: d.rejectionReason
      };
    });

    const allRequiredDocs = [...commonDocs, ...industryDocs];
    const docsWithStatus = allRequiredDocs.map(doc => ({
      ...doc,
      uploaded: uploadedTypes.includes(doc.type),
      status: uploadedMap[doc.type]?.status || null,
      uploadedAt: uploadedMap[doc.type]?.uploadedAt || null,
      rejectionReason: uploadedMap[doc.type]?.rejectionReason || null
    }));

    const requiredCount = allRequiredDocs.length;
    const uploadedCount = allRequiredDocs.filter(d => uploadedTypes.includes(d.type)).length;
    const approvedCount = allRequiredDocs.filter(d => uploadedMap[d.type]?.status === 'approved').length;
    const rejectedCount = allRequiredDocs.filter(d => uploadedMap[d.type]?.status === 'rejected').length;
    const pendingCount = allRequiredDocs.filter(d => uploadedMap[d.type]?.status === 'pending').length;

    res.json({
      sector,
      industry,
      sectorLabel: SECTOR_LABELS[sector] || sector,
      sectorDescription: SECTOR_DESCRIPTIONS[sector] || '',
      commonDocs: commonDocs.map(doc => ({
        ...doc,
        uploaded: uploadedTypes.includes(doc.type),
        status: uploadedMap[doc.type]?.status || null,
        uploadedAt: uploadedMap[doc.type]?.uploadedAt || null,
        rejectionReason: uploadedMap[doc.type]?.rejectionReason || null
      })),
      industryDocs: industryDocs.map(doc => ({
        ...doc,
        uploaded: uploadedTypes.includes(doc.type),
        status: uploadedMap[doc.type]?.status || null,
        uploadedAt: uploadedMap[doc.type]?.uploadedAt || null,
        rejectionReason: uploadedMap[doc.type]?.rejectionReason || null
      })),
      allDocs: docsWithStatus,
      stats: {
        total: requiredCount,
        uploaded: uploadedCount,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
        missing: requiredCount - uploadedCount
      },
      verificationStatus: organization.verificationStatus
    });
  } catch (error) {
    next(error);
  }
};

exports.getDocumentHelp = async (req, res, next) => {
  try {
    const { sector, industry } = req.query;

    if (!sector || !ONBOARDING_DATA[sector]) {
      return res.status(400).json({ message: 'Valid sector is required.' });
    }

    const sectorData = ONBOARDING_DATA[sector];
    const commonDocs = sectorData.common || [];
    const industryDocs = sectorData.industries?.[industry] || [];

    res.json({
      sector,
      industry,
      sectorLabel: SECTOR_LABELS[sector],
      commonDocs,
      industryDocs,
      allDocs: [...commonDocs, ...industryDocs]
    });
  } catch (error) {
    next(error);
  }
};

exports.getDocumentDetail = async (req, res, next) => {
  try {
    const { sector, docType } = req.params;

    if (!sector || !ONBOARDING_DATA[sector]) {
      return res.status(400).json({ message: 'Valid sector is required.' });
    }

    const sectorData = ONBOARDING_DATA[sector];
    const allDocs = [
      ...(sectorData.common || []),
      ...Object.values(sectorData.industries || {}).flat()
    ];

    const doc = allDocs.find(d => d.type === docType);
    if (!doc) {
      return res.status(404).json({ message: 'Document type not found for this sector.' });
    }

    res.json(doc);
  } catch (error) {
    next(error);
  }
};

exports.getAvailableIndustries = async (req, res, next) => {
  try {
    const { sector } = req.params;

    if (!sector || !ONBOARDING_DATA[sector]) {
      return res.status(400).json({ message: 'Valid sector is required.' });
    }

    const sectorData = ONBOARDING_DATA[sector];
    const industries = Object.keys(sectorData.industries || {});

    res.json({
      sector,
      sectorLabel: SECTOR_LABELS[sector],
      industries
    });
  } catch (error) {
    next(error);
  }
};
