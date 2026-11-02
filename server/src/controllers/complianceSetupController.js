const Organization = require('../models/Organization');
const Compliance = require('../models/Compliance');
const COMPLIANCE_DATA = require('../data/complianceData');
const { getMandatoryComplianceIds } = require('../data/questionnaireData');

exports.getComplianceOptions = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const { sector, industry } = organization;
    if (!sector || !industry) {
      return res.status(400).json({ message: 'Sector and industry must be set on your organization.' });
    }

    const common = (COMPLIANCE_DATA.common || []).filter(item => {
      if (!item.sectors) return true;
      return item.sectors.includes(sector);
    });
    const sectorIndustries = COMPLIANCE_DATA[sector] || {};
    const industrySpecific = sectorIndustries[industry] || [];
    const commonForSector = COMPLIANCE_DATA.commonIndustries?.[sector] || [];

    const dedup = (items) => {
      const seen = new Set();
      return items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    };

    const grouped = {
      common: dedup(common),
      sector: dedup(commonForSector),
      industry: dedup(industrySpecific)
    };

    const allOptions = [...grouped.common, ...grouped.sector, ...grouped.industry];
    const selectedIds = (organization.selectedCompliances || []).map(s => s.complianceId);

    let impact = { mandatory: [], recommended: [] };
    if (organization.questionnaireCompleted && organization.questionnaireAnswers) {
      const answers = organization.questionnaireAnswers;
      const plainAnswers = {
        turnover: answers.turnover,
        employees: answers.employees,
        hasPhysicalOffice: answers.hasPhysicalOffice ? 'yes' : 'no',
        importsExports: answers.importsExports ? 'yes' : 'no',
        handlesPersonalData: answers.handlesPersonalData ? 'yes' : 'no',
        providesFinancialServices: answers.providesFinancialServices ? 'yes' : 'no',
        usesHazardousMaterials: answers.usesHazardousMaterials ? 'yes' : 'no',
        productionCapacity: answers.productionCapacity,
        sellsOnline: answers.sellsOnline ? 'yes' : 'no',
        handlesFoodProducts: answers.handlesFoodProducts ? 'yes' : 'no'
      };
      impact = getMandatoryComplianceIds(sector, plainAnswers);
    }

    res.json({
      sector,
      industry,
      grouped,
      options: allOptions,
      selectedIds,
      complianceSetupComplete: organization.complianceSetupComplete,
      questionnaireCompleted: organization.questionnaireCompleted,
      impact
    });
  } catch (error) {
    next(error);
  }
};

exports.saveComplianceSelection = async (req, res, next) => {
  try {
    const { complianceIds } = req.body;
    if (!Array.isArray(complianceIds)) {
      return res.status(400).json({ message: 'complianceIds must be an array.' });
    }

    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    const selectedCompliances = complianceIds.map(id => ({
      complianceId: id,
      selectedAt: new Date()
    }));

    organization.selectedCompliances = selectedCompliances;
    organization.complianceSetupComplete = true;
    await organization.save();

    res.json({
      message: 'Compliance selection saved successfully.',
      selectedCompliances: organization.selectedCompliances,
      complianceSetupComplete: true
    });
  } catch (error) {
    next(error);
  }
};

exports.autoCreateCompliances = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    if (!organization.complianceSetupComplete) {
      return res.status(400).json({ message: 'Compliance setup not complete yet.' });
    }

    const selectedIds = (organization.selectedCompliances || []).map(s => s.complianceId);
    if (selectedIds.length === 0) {
      return res.status(400).json({ message: 'No compliances selected.' });
    }

    const { sector, industry } = organization;
    const common = (COMPLIANCE_DATA.common || []).filter(item => {
      if (!item.sectors) return true;
      return item.sectors.includes(sector);
    });
    const sectorIndustries = COMPLIANCE_DATA[sector] || {};
    const industrySpecific = sectorIndustries[industry] || [];
    const commonForSector = COMPLIANCE_DATA.commonIndustries?.[sector] || [];

    const seen = new Set();
    const allOptions = [];
    for (const item of [...common, ...commonForSector, ...industrySpecific]) {
      if (!seen.has(item.id)) { seen.add(item.id); allOptions.push(item); }
    }
    const selectedMap = {};
    for (const item of allOptions) {
      if (selectedIds.includes(item.id)) selectedMap[item.id] = item;
    }

    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const freqMap = {
      'monthly': 1, 'quarterly': 3, 'half-yearly': 6, 'yearly': 12, 'one-time': 0, 'event-based': 0
    };

    const existingCount = await Compliance.countDocuments({ organization: organization._id });

    if (existingCount > 0) {
      return res.json({
        message: `${existingCount} compliance items already exist. Skipping creation.`,
        created: 0
      });
    }

    const items = [];
    for (const id of selectedIds) {
      const template = selectedMap[id];
      if (!template) continue;

      let dueDate;
      const freq = template.frequency;

      if (freq === 'monthly') {
        if (template.id === 'GST_GSTR1') {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(11);
        } else if (template.id === 'GST_GSTR3B') {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(20);
        } else if (template.id.startsWith('TDS_') && template.id !== 'TDS_RETURN') {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(7);
        } else if (template.id === 'PF_MONTHLY') {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(15);
        } else if (template.id === 'ESI_MONTHLY') {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(15);
        } else {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(15);
        }
      } else if (freq === 'quarterly') {
        if (template.id === 'GST_GSTR1_Q') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const nextQuarterMonth = (currentQuarter + 1) * 3;
          dueDate = new Date(now.getFullYear(), nextQuarterMonth, 13);
        } else if (template.id === 'GST_GSTR3B_Q') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const nextQuarterMonth = (currentQuarter + 1) * 3;
          dueDate = new Date(now.getFullYear(), nextQuarterMonth, 22);
        } else if (template.id === 'TDS_RETURN') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const nextQuarterMonth = (currentQuarter + 1) * 3;
          dueDate = new Date(now.getFullYear(), nextQuarterMonth, 31);
        } else if (template.id === 'IT_ADVANCE') {
          const month = now.getMonth();
          if (month < 3) dueDate = new Date(now.getFullYear(), 5, 15);
          else if (month < 6) dueDate = new Date(now.getFullYear(), 8, 15);
          else if (month < 9) dueDate = new Date(now.getFullYear(), 11, 15);
          else dueDate = new Date(now.getFullYear() + 1, 2, 15);
        } else if (template.id === 'BOARD_MEET') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const nextQuarterMonth = (currentQuarter + 1) * 3;
          dueDate = new Date(now.getFullYear(), nextQuarterMonth, 1);
        } else {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 3);
          dueDate.setDate(15);
        }
      } else if (freq === 'yearly' || freq === 'half-yearly') {
        if (template.id === 'PF_RETURN') {
          dueDate = new Date(now.getFullYear(), 10, 30);
        } else if (template.id === 'SHOP_ACT') {
          dueDate = new Date(now.getFullYear(), 2, 31);
        } else {
          dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + 3);
        }
      } else {
        dueDate = new Date(nextYear);
      }

      items.push({
        organization: organization._id,
        title: template.title,
        law: template.law,
        regulation: template.id,
        category: template.category,
        description: template.description,
        frequency: template.frequency,
        priority: template.priority,
        dueDate,
        status: 'pending',
        isRecurring: freq !== 'one-time' && freq !== 'event-based',
        penalties: template.penalties || []
      });
    }

    let created = [];
    if (items.length > 0) {
      created = await Compliance.insertMany(items);
    }

    res.status(201).json({
      message: `${created.length} compliance items created successfully.`,
      created: created.length
    });
  } catch (error) {
    next(error);
  }
};
