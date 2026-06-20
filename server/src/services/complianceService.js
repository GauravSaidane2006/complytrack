const cron = require('node-cron');
const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');
const Organization = require('../models/Organization');

const updateOverdueStatus = async () => {
  try {
    const now = new Date();
    const result = await Compliance.updateMany(
      {
        dueDate: { $lt: now },
        status: { $nin: ['completed', 'waived', 'overdue'] }
      },
      { $set: { status: 'overdue' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} items as overdue.`);
    }
  } catch (error) {
    console.error('Error updating overdue status:', error.message);
  }
};

const generateDeadlineAlerts = async () => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingItems = await Compliance.find({
      dueDate: { $gte: now, $lte: sevenDaysLater },
      status: { $nin: ['completed', 'waived', 'overdue'] }
    }).populate('assignedTo');

    for (const item of upcomingItems) {
      const existingAlert = await Alert.findOne({
        organization: item.organization,
        complianceItem: item._id,
        type: 'deadline',
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      });
      if (existingAlert) continue;

      const daysUntilDue = Math.ceil((item.dueDate - now) / (1000 * 60 * 60 * 24));

      for (const user of item.assignedTo) {
        await Alert.create({
          organization: item.organization,
          user: user._id,
          type: 'deadline',
          title: daysUntilDue <= 0 ? `OVERDUE: ${item.title}` : `Upcoming: ${item.title}`,
          message: daysUntilDue <= 0
            ? `${item.title} was due on ${item.dueDate.toLocaleDateString()}. Immediate action required.`
            : `${item.title} is due in ${daysUntilDue} day(s) on ${item.dueDate.toLocaleDateString()}.`,
          complianceItem: item._id,
          priority: item.priority,
          sentVia: ['in-app'],
          scheduledFor: now
        });
      }
    }
  } catch (error) {
    console.error('Error generating alerts:', error.message);
  }
};

const updateOrganizationHealthScores = async () => {
  try {
    const organizations = await Organization.find({ isActive: true });
    for (const org of organizations) {
      const total = await Compliance.countDocuments({ organization: org._id });
      const completed = await Compliance.countDocuments({
        organization: org._id,
        status: { $in: ['completed', 'waived'] }
      });
      const score = total > 0 ? Math.round((completed / total) * 100) : 100;
      await Organization.findByIdAndUpdate(org._id, { complianceHealthScore: score });
    }
  } catch (error) {
    console.error('Error updating health scores:', error.message);
  }
};

const startScheduledJobs = () => {
  cron.schedule('0 * * * *', () => {
    updateOverdueStatus();
  });

  cron.schedule('0 */6 * * *', () => {
    generateDeadlineAlerts();
  });

  cron.schedule('0 2 * * *', () => {
    updateOrganizationHealthScores();
  });

  console.log('Scheduled jobs started.');
};

module.exports = { startScheduledJobs, updateOverdueStatus, generateDeadlineAlerts, updateOrganizationHealthScores };
