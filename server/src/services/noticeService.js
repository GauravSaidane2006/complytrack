const cron = require('node-cron');
const Notice = require('../models/Notice');
const Compliance = require('../models/Compliance');
const { generateNoticePDF } = require('../utils/noticePdfGenerator');
const path = require('path');
const fs = require('fs');

const createNoticeWithPDF = async (noticeData) => {
  try {
    const notice = await Notice.create(noticeData);

    const noticesDir = path.join(__dirname, '../../notices');
    if (!fs.existsSync(noticesDir)) fs.mkdirSync(noticesDir, { recursive: true });

    const filePath = path.join(noticesDir, `notice_${notice._id}.pdf`);
    await generateNoticePDF(notice, filePath);
    notice.pdfUrl = `/notices/notice_${notice._id}.pdf`;
    await notice.save();

    return notice;
  } catch (error) {
    console.error('Error creating notice:', error.message);
    return null;
  }
};

const generateComplianceChangeNotice = async (compliance, changeType, changes) => {
  const title = `${changeType}: ${compliance.title}`;
  const message = `The compliance item "${compliance.title}" (${compliance.law}) has been ${changeType}. Status: ${compliance.status}. Priority: ${compliance.priority}. Due Date: ${compliance.dueDate ? new Date(compliance.dueDate).toLocaleDateString('en-IN') : 'N/A'}.`;

  return createNoticeWithPDF({
    organization: compliance.organization,
    title,
    type: 'compliance-change',
    message,
    priority: compliance.priority === 'critical' ? 'critical' : compliance.priority === 'high' ? 'high' : 'medium',
    relatedCompliance: compliance._id,
    changes: changes || [],
    sentBy: 'system'
  });
};

const checkOverdueItems = async () => {
  try {
    const now = new Date();
    const overdueItems = await Compliance.find({
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'waived', 'overdue'] }
    });

    for (const item of overdueItems) {
      const existingNotice = await Notice.findOne({
        organization: item.organization,
        relatedCompliance: item._id,
        type: 'deadline',
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      });

      if (existingNotice) continue;

      await createNoticeWithPDF({
        organization: item.organization,
        title: `OVERDUE: ${item.title}`,
        type: 'deadline',
        message: `The compliance item "${item.title}" (${item.law}) was due on ${new Date(item.dueDate).toLocaleDateString('en-IN')} and is now overdue. Immediate action is required to avoid penalties.`,
        priority: 'critical',
        relatedCompliance: item._id,
        changes: [
          { field: 'Status', oldValue: item.status, newValue: 'overdue' },
          { field: 'Due Date', oldValue: new Date(item.dueDate).toLocaleDateString('en-IN'), newValue: 'PAST DUE' }
        ],
        sentBy: 'system'
      });
    }
  } catch (error) {
    console.error('Error checking overdue items:', error.message);
  }
};

const generateDailySummary = async () => {
  try {
    const organizations = await Compliance.distinct('organization');

    for (const orgId of organizations) {
      const total = await Compliance.countDocuments({ organization: orgId });
      const completed = await Compliance.countDocuments({ organization: orgId, status: 'completed' });
      const pending = await Compliance.countDocuments({ organization: orgId, status: 'pending' });
      const overdue = await Compliance.countDocuments({ organization: orgId, status: 'overdue' });
      const inProgress = await Compliance.countDocuments({ organization: orgId, status: 'in-progress' });
      const score = total > 0 ? Math.round((completed / total) * 100) : 100;

      const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

      await createNoticeWithPDF({
        organization: orgId,
        title: `Daily Compliance Summary — ${today}`,
        type: 'system-update',
        message: `Daily compliance health report.\n\nTotal Items: ${total}\nCompleted: ${completed}\nPending: ${pending}\nIn Progress: ${inProgress}\nOverdue: ${overdue}\n\nCompliance Score: ${score}%\n\n${overdue > 0 ? `WARNING: ${overdue} item(s) are overdue and require immediate attention.` : 'All items are on track.'}`,
        priority: overdue > 0 ? 'high' : 'low',
        changes: [
          { field: 'Compliance Score', oldValue: '-', newValue: `${score}%` },
          { field: 'Total Items', oldValue: '-', newValue: `${total}` },
          { field: 'Overdue', oldValue: '-', newValue: `${overdue}` }
        ],
        sentBy: 'system'
      });
    }
  } catch (error) {
    console.error('Error generating daily summary:', error.message);
  }
};

const startNoticeJobs = () => {
  cron.schedule('*/30 * * * *', () => {
    checkOverdueItems();
  });

  cron.schedule('0 8 * * *', () => {
    generateDailySummary();
  });

  console.log('Notice service jobs started.');
};

module.exports = {
  startNoticeJobs,
  createNoticeWithPDF,
  generateComplianceChangeNotice,
  checkOverdueItems,
  generateDailySummary
};
