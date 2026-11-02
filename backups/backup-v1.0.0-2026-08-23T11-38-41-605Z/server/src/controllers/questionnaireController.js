const Organization = require('../models/Organization');
const { getQuestionnaireBySector, getMandatoryComplianceIds } = require('../data/questionnaireData');

exports.getQuestions = async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId).select('sector industry');
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const questions = getQuestionnaireBySector(org.sector);
    res.json({ sector: org.sector, industry: org.industry, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const org = await Organization.findById(req.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    org.questionnaireAnswers = {
      turnover: answers.turnover || '',
      employees: answers.employees || '',
      hasPhysicalOffice: answers.hasPhysicalOffice === 'yes',
      importsExports: answers.importsExports === 'yes',
      handlesPersonalData: answers.handlesPersonalData === 'yes',
      providesFinancialServices: answers.providesFinancialServices === 'yes',
      usesHazardousMaterials: answers.usesHazardousMaterials === 'yes',
      productionCapacity: answers.productionCapacity || '',
      sellsOnline: answers.sellsOnline === 'yes',
      handlesFoodProducts: answers.handlesFoodProducts === 'yes'
    };

    if (answers.turnover) org.turnover = answers.turnover;
    org.questionnaireCompleted = true;

    await org.save();

    const impact = getMandatoryComplianceIds(org.sector, answers);

    res.json({
      message: 'Questionnaire completed successfully',
      questionnaireCompleted: true,
      impact
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getImpact = async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId).select('sector questionnaireAnswers questionnaireCompleted');
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (!org.questionnaireCompleted) {
      return res.json({ questionnaireCompleted: false, impact: { mandatory: [], recommended: [] } });
    }

    const answers = org.questionnaireAnswers;
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

    const impact = getMandatoryComplianceIds(org.sector, plainAnswers);
    res.json({ questionnaireCompleted: true, impact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
