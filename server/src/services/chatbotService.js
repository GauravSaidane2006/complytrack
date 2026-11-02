let Compliance, Alert, Contract, RiskAssessment, Report, Template, Notice, Organization, User;

function loadModels() {
  if (Compliance) return;
  try { Compliance = require('../models/Compliance'); } catch {}
  try { Alert = require('../models/Alert'); } catch {}
  try { Contract = require('../models/Contract'); } catch {}
  try { RiskAssessment = require('../models/RiskAssessment'); } catch {}
  try { Report = require('../models/Report'); } catch {}
  try { Template = require('../models/Template'); } catch {}
  try { Notice = require('../models/Notice'); } catch {}
  try { Organization = require('../models/Organization'); } catch {}
  try { User = require('../models/User'); } catch {}
}

const INTENTS = [
  { patterns: [/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|sup|yo)\b/i], handler: 'greeting' },
  { patterns: [/how\s*(many|much)\s*(compliance|compliances|items|tasks)/i, /compliance\s*(count|status|summary|overview)/i, /what.*(compliance|compliances)\s*(do\s*i\s*have|status|summary)/i, /my\s*compliance/], handler: 'complianceCount' },
  { patterns: [/overdue|missed|late|past\s*due|expired|behind\s*schedule/i], handler: 'overdueItems' },
  { patterns: [/due\s*(date|soon|up)|upcoming|deadline|expiring|next\s*(due|deadline)/i], handler: 'upcomingDeadlines' },
  { patterns: [/alert|notification|unread|notify|bell/i], handler: 'alertSummary' },
  { patterns: [/risk|risks|assessment|risk\s*(score|matrix|level)/i], handler: 'riskOverview' },
  { patterns: [/contract|contracts|agreement|agreements/i], handler: 'contractInfo' },
  { patterns: [/report|reports|generate.*report|compliance.*report/i], handler: 'reportsHelp' },
  { patterns: [/template|templates/i], handler: 'templatesHelp' },
  { patterns: [/setting|settings|profile|account|my\s*account/i], handler: 'settingsHelp' },
  { patterns: [/user|users|team|member|members|add.*user/i], handler: 'usersHelp' },
  { patterns: [/dashboard|overview|summary|home|main\s*page/i], handler: 'dashboardHelp' },
  { patterns: [/verification|verif|document|documents|upload.*status/i], handler: 'verificationHelp' },
  { patterns: [/license|subscription|plan|renewal|expiry/i], handler: 'licenseHelp' },
  { patterns: [/organization|company|my\s*company|org\s*detail|company\s*info/i], handler: 'orgInfo' },
  { patterns: [/notice|notices|audit|log/i], handler: 'noticesHelp' },
  { patterns: [/sector.*pdf|reference.*pdf|pdf.*reference/i], handler: 'sectorPdfsHelp' },
  { patterns: [/how\s*(do\s*i|to|can\s*i)|help|what\s*(can|should)\s*i|guide|tutorial|explain/i], handler: 'howToHelp' },
  { patterns: [/thank|thanks|thx|ty|appreciate/i], handler: 'thanks' },
  { patterns: [/bye|goodbye|see\s*ya|later|cya/i], handler: 'goodbye' }
];

const NAV_MAP = {
  dashboard: { path: '/dashboard', label: 'Dashboard' },
  compliance: { path: '/compliance', label: 'Compliance' },
  'compliance new': { path: '/compliance/new', label: 'New Compliance' },
  'add compliance': { path: '/compliance/new', label: 'New Compliance' },
  alerts: { path: '/alerts', label: 'Alerts' },
  notifications: { path: '/alerts', label: 'Alerts' },
  reports: { path: '/reports', label: 'Reports' },
  contracts: { path: '/contracts', label: 'Contracts' },
  risks: { path: '/risks', label: 'Risk Assessment' },
  'risk assessment': { path: '/risks', label: 'Risk Assessment' },
  templates: { path: '/templates', label: 'Templates' },
  settings: { path: '/settings', label: 'Settings' },
  users: { path: '/users', label: 'Users' },
  'user management': { path: '/users', label: 'Users' },
  notices: { path: '/notices', label: 'Notices' },
  'reference pdfs': { path: '/sector-pdfs', label: 'Reference PDFs' },
  'sector pdfs': { path: '/sector-pdfs', label: 'Reference PDFs' },
  'company report': { path: '/company-report', label: 'Company Report' },
  questionnaire: { path: '/questionnaire', label: 'Compliance Profile' },
  'compliance profile': { path: '/questionnaire', label: 'Compliance Profile' },
  'compliance setup': { path: '/compliance-setup', label: 'Compliance Setup' },
  verification: { path: '/verification-status', label: 'Verification Status' },
  'document review': { path: '/document-review', label: 'Document Review' }
};

function matchIntent(message) {
  const cleaned = message.trim().toLowerCase();
  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(cleaned)) return intent.handler;
    }
  }
  if (/\b(go\s*to|open|show|show\s*me|take\s*me\s*to|navigate|switch\s*to|view)\b/i.test(cleaned)) return 'navigate';
  return 'fallback';
}

function detectNavigation(message) {
  const cleaned = message.trim().toLowerCase();
  for (const [key, nav] of Object.entries(NAV_MAP)) {
    if (cleaned.includes(key)) return nav;
  }
  return null;
}

async function handleGreeting(user) {
  const firstName = user.name ? user.name.split(' ')[0] : 'there';
  return {
    response: `Hello ${firstName}! I'm ComplyTrackAI, your compliance assistant. I can help you:\n\n• Check your compliance status\n• View alerts and deadlines\n• Navigate the app\n• Understand your contracts & risks\n\nWhat would you like to know?`,
    suggestions: ['My compliance status', 'Show overdue items', 'Upcoming deadlines', 'Go to dashboard']
  };
}

async function handleComplianceCount(user, orgId) {
  if (!Compliance) return { response: 'Compliance data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const items = await Compliance.find({ organization: orgId });
  const completed = items.filter(i => i.status === 'completed').length;
  const inProgress = items.filter(i => i.status === 'in-progress').length;
  const pending = items.filter(i => i.status === 'pending').length;
  const overdue = items.filter(i => i.status === 'overdue').length;
  const waived = items.filter(i => i.status === 'waived').length;
  const score = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  let response = `📊 **Your Compliance Overview**\n\nTotal items: ${items.length}\n✅ Completed: ${completed}\n⏳ In Progress: ${inProgress}\n📋 Pending: ${pending}\n🚨 Overdue: ${overdue}\n🚫 Waived: ${waived}\n\n**Compliance Score: ${score}%**`;

  if (overdue > 0) {
    const overdueItems = items.filter(i => i.status === 'overdue').slice(0, 3);
    response += '\n\n🚨 **Overdue Items:**\n';
    overdueItems.forEach(item => {
      const due = item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : 'No date set';
      response += `• ${item.title} (due: ${due})\n`;
    });
  }

  return { response, suggestions: ['View overdue items', 'Upcoming deadlines', 'Go to compliance', 'Risk assessment'] };
}

async function handleOverdueItems(user, orgId) {
  if (!Compliance) return { response: 'Compliance data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const items = await Compliance.find({ organization: orgId, status: 'overdue' }).sort({ dueDate: 1 });

  if (items.length === 0) {
    return { response: '✅ Great news! You have no overdue compliance items. Keep it up!', suggestions: ['View all compliance', 'Upcoming deadlines', 'Dashboard'] };
  }

  let response = `🚨 **Overdue Items (${items.length})**\n\n`;
  items.slice(0, 5).forEach((item, idx) => {
    const due = item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : 'No date';
    const priority = item.priority === 'critical' ? '🔴' : item.priority === 'high' ? '🟠' : item.priority === 'medium' ? '🟡' : '🟢';
    response += `${idx + 1}. ${priority} ${item.title}\n   Law: ${item.law} | Due: ${due} | Priority: ${item.priority}\n\n`;
  });

  if (items.length > 5) response += `...and ${items.length - 5} more.`;

  return { response, suggestions: ['Go to compliance', 'View all items', 'Dashboard', 'Risk assessment'] };
}

async function handleUpcomingDeadlines(user, orgId) {
  if (!Compliance) return { response: 'Compliance data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const items = await Compliance.find({
    organization: orgId,
    status: { $in: ['pending', 'in-progress'] },
    dueDate: { $gte: now, $lte: thirtyDays }
  }).sort({ dueDate: 1 });

  if (items.length === 0) {
    return { response: '📅 No upcoming deadlines in the next 30 days.', suggestions: ['View all compliance', 'Dashboard', 'Overdue items'] };
  }

  let response = `📅 **Upcoming Deadlines (Next 30 Days)**\n\n`;
  items.slice(0, 5).forEach((item, idx) => {
    const due = new Date(item.dueDate).toLocaleDateString('en-IN');
    const daysLeft = Math.ceil((new Date(item.dueDate) - now) / (1000 * 60 * 60 * 24));
    const urgency = daysLeft <= 3 ? '🔴' : daysLeft <= 7 ? '🟠' : '🟢';
    response += `${idx + 1}. ${urgency} ${item.title}\n   Due: ${due} (${daysLeft} days left) | Priority: ${item.priority}\n\n`;
  });

  return { response, suggestions: ['View all compliance', 'Go to alerts', 'Dashboard'] };
}

async function handleAlertSummary(user, orgId) {
  if (!Alert) return { response: 'Alert data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const total = await Alert.countDocuments({ organization: orgId });
  const unread = await Alert.countDocuments({ organization: orgId, isRead: false });
  const critical = await Alert.countDocuments({ organization: orgId, isRead: false, priority: { $in: ['critical', 'high'] } });

  const recentAlerts = await Alert.find({ organization: orgId, isRead: false }).sort({ createdAt: -1 }).limit(3);

  let response = `🔔 **Alert Summary**\n\nTotal alerts: ${total}\n📬 Unread: ${unread}\n🚨 Critical/High: ${critical}`;

  if (recentAlerts.length > 0) {
    response += '\n\n**Recent Unread:**\n';
    recentAlerts.forEach(alert => {
      const priority = alert.priority === 'critical' ? '🔴' : alert.priority === 'high' ? '🟠' : alert.priority === 'medium' ? '🟡' : '🟢';
      response += `${priority} ${alert.title}\n`;
    });
  }

  if (unread === 0) response = '🔔 **All caught up!** You have no unread alerts.';

  return { response, suggestions: ['Go to alerts', 'Mark all as read', 'Dashboard'] };
}

async function handleRiskOverview(user, orgId) {
  if (!RiskAssessment) return { response: 'Risk data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const risks = await RiskAssessment.find({ organization: orgId });

  if (risks.length === 0) {
    return { response: '🛡️ No risk assessments found. Consider running a risk assessment for your compliance items.', suggestions: ['Go to risk assessment', 'View compliance', 'Dashboard'] };
  }

  const identified = risks.filter(r => r.status === 'identified').length;
  const mitigated = risks.filter(r => r.status === 'mitigated').length;
  const monitoring = risks.filter(r => r.status === 'monitoring').length;
  const highRisk = risks.filter(r => r.impact === 'critical' || r.impact === 'high').length;

  let response = `🛡️ **Risk Overview**\n\nTotal risks: ${risks.length}\n⚠️ Identified: ${identified}\n✅ Mitigated: ${mitigated}\n👀 Monitoring: ${monitoring}\n🔴 High/Critical Impact: ${highRisk}`;

  return { response, suggestions: ['Go to risk assessment', 'View compliance', 'Dashboard'] };
}

async function handleContractInfo(user, orgId) {
  if (!Contract) return { response: 'Contract data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const contracts = await Contract.find({ organization: orgId });

  if (contracts.length === 0) {
    return { response: '📄 No contracts found. You can add contracts from the Contracts page.', suggestions: ['Go to contracts', 'Dashboard'] };
  }

  const active = contracts.filter(c => c.status === 'active').length;
  const expired = contracts.filter(c => c.status === 'expired').length;
  const draft = contracts.filter(c => c.status === 'draft').length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);

  let response = `📄 **Contract Overview**\n\nTotal contracts: ${contracts.length}\n✅ Active: ${active}\n📝 Draft: ${draft}\n❌ Expired: ${expired}\n💰 Total Value: ₹${totalValue.toLocaleString('en-IN')}`;

  const activeContracts = contracts.filter(c => c.status === 'active').slice(0, 3);
  if (activeContracts.length > 0) {
    response += '\n\n**Active Contracts:**\n';
    activeContracts.forEach(c => { response += `• ${c.title} (${c.party || 'Unknown party'})\n`; });
  }

  return { response, suggestions: ['Go to contracts', 'View all', 'Dashboard'] };
}

async function handleOrgInfo(user, orgId) {
  if (!Organization) return { response: 'Organization data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const org = await Organization.findById(orgId);
  if (!org) return { response: 'Could not find your organization details.', suggestions: ['Dashboard'] };

  let response = `🏢 **Your Organization**\n\nName: ${org.name}\nCompany ID: ${org.companyId}\nSector: ${org.sector || 'Not set'}\nIndustry: ${org.industry || 'Not set'}\nVerification: ${org.verificationStatus || 'Not started'}`;

  if (org.complianceHealthScore !== undefined) response += `\n📊 Health Score: ${org.complianceHealthScore}/100`;

  if (org.subscription) {
    response += `\n📋 Plan: ${org.subscription.plan || 'None'}`;
    if (org.subscription.endDate) {
      const endDate = new Date(org.subscription.endDate);
      const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      response += `\n📅 Expires: ${endDate.toLocaleDateString('en-IN')} (${daysLeft} days left)`;
    }
  }

  return { response, suggestions: ['Go to settings', 'View compliance', 'Dashboard'] };
}

async function handleVerificationHelp(user, orgId) {
  if (!Organization) return { response: 'Verification data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const org = await Organization.findById(orgId);
  const status = org?.verificationStatus || 'unknown';

  let response = `📋 **Verification Status: ${status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}**\n\n`;

  if (status === 'verified') response += 'Your organization is verified! All documents have been approved.';
  else if (status === 'pending') response += 'Your verification is pending. Please upload the required documents.';
  else if (status === 'documents_required') response += 'Please upload the required documents to proceed with verification.';
  else if (status === 'under_review') response += 'Your documents are under review. This typically takes 1-2 business days.';
  else if (status === 'rejected') response += 'Some documents were rejected. Please check the details and re-upload.';
  else response += 'Check your verification status and upload documents from the verification page.';

  return { response, suggestions: ['Go to verification', 'Upload documents', 'Dashboard'] };
}

async function handleLicenseHelp(user, orgId) {
  if (!Organization) return { response: 'License data is temporarily unavailable.', suggestions: ['Dashboard'] };
  const org = await Organization.findById(orgId);
  const sub = org?.subscription;

  let response = '🔑 **License Information**\n\n';

  if (sub && sub.plan) {
    response += `Plan: ${sub.plan}\n`;
    if (sub.startDate) response += `Started: ${new Date(sub.startDate).toLocaleDateString('en-IN')}\n`;
    if (sub.endDate) {
      const endDate = new Date(sub.endDate);
      const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      response += `Expires: ${endDate.toLocaleDateString('en-IN')} (${daysLeft} days left)\n`;
      if (daysLeft <= 7) response += '⚠️ Your license is expiring soon!';
    }
  } else {
    response += 'No active license found. Please activate a license to continue.';
  }

  return { response, suggestions: ['Go to settings', 'Contact support', 'Dashboard'] };
}

async function handleHowToHelp() {
  return {
    response: `📖 **How can I help you?**\n\nHere are some things I can assist with:\n\n🔍 **Check Data:**\n• "How many compliance items do I have?"\n• "Show overdue items"\n• "Upcoming deadlines"\n• "My alerts"\n• "Risk overview"\n• "My contracts"\n\n🧭 **Navigate:**\n• "Go to compliance"\n• "Take me to alerts"\n• "Open reports"\n• "Show settings"\n\n🏢 **Organization:**\n• "My company info"\n• "Verification status"\n• "License info"\n\nJust type your question naturally!`,
    suggestions: ['Compliance status', 'My alerts', 'Go to dashboard', 'Organization info']
  };
}

async function handleThanks() {
  return { response: "You're welcome! Is there anything else I can help you with?", suggestions: ['Compliance status', 'Alerts', 'Dashboard', 'Nothing else'] };
}

async function handleGoodbye() {
  return { response: "Goodbye! Feel free to ask me anything anytime. Have a productive day!", suggestions: [] };
}

async function handleNavigate(message, user) {
  const nav = detectNavigation(message);
  if (nav) {
    const isAdmin = ['admin', 'superadmin', 'developer'].includes(user.role);
    if (nav.path === '/users' && !isAdmin) {
      return { response: '⛔ You need admin privileges to access User Management. Contact your admin.', suggestions: ['Dashboard', 'Compliance', 'My alerts'] };
    }
    return { response: `🧭 Navigating to ${nav.label}...`, navigate: nav.path, suggestions: [] };
  }
  return { response: "I couldn't find that page. Here are the pages I can navigate to:", suggestions: ['Dashboard', 'Compliance', 'Alerts', 'Reports', 'Contracts', 'Settings'] };
}

async function handleFallback() {
  return {
    response: "I'm not sure I understand that. Here's what I can help with:\n\n• Check compliance status & overdue items\n• View alerts & deadlines\n• Navigate to any page\n• View contracts, risks & reports\n• Organization & license info\n\nTry asking something like \"How many compliance items do I have?\" or \"Go to alerts\".",
    suggestions: ['Compliance status', 'My alerts', 'Navigate somewhere', 'How to use']
  };
}

const HANDLERS = {
  greeting: handleGreeting,
  complianceCount: handleComplianceCount,
  overdueItems: handleOverdueItems,
  upcomingDeadlines: handleUpcomingDeadlines,
  alertSummary: handleAlertSummary,
  riskOverview: handleRiskOverview,
  contractInfo: handleContractInfo,
  reportsHelp: async () => ({
    response: '📊 **Reports**\n\nYou can generate compliance reports from the Reports page. Reports can be exported as PDF or Excel.\n\nTo generate a report:\n1. Go to Reports\n2. Click "Generate Report"\n3. Select filters (status, law, priority, date range)\n4. Choose format (PDF/Excel)\n5. Download',
    suggestions: ['Go to reports', 'Compliance status', 'Dashboard']
  }),
  templatesHelp: async () => ({
    response: '📋 **Compliance Templates**\n\nTemplates help you quickly create compliance items based on common requirements for your industry.\n\nYou can browse templates, create new ones, or auto-create compliance items from templates.',
    suggestions: ['Go to templates', 'Add compliance', 'Dashboard']
  }),
  settingsHelp: async () => ({
    response: '⚙️ **Settings**\n\nFrom Settings you can:\n• Update your profile (name, phone, designation)\n• Change your password\n• View organization details\n• Manage your account',
    suggestions: ['Go to settings', 'Change password', 'Organization info']
  }),
  usersHelp: async (user) => {
    const isAdmin = ['admin', 'superadmin'].includes(user.role);
    if (!isAdmin) return { response: '⛔ User management is only available to admins. Contact your administrator.', suggestions: ['Dashboard', 'Settings'] };
    return { response: '👥 **User Management**\n\nAs an admin, you can:\n• View all team members\n• Add new users\n• Edit user roles\n• Remove users\n\nAll users in your organization are listed on the Users page.', suggestions: ['Go to users', 'Add user', 'Dashboard'] };
  },
  dashboardHelp: async () => ({
    response: '🏠 **Dashboard**\n\nYour dashboard shows:\n• Compliance health score\n• Status breakdown (completed/pending/overdue)\n• Upcoming deadlines\n• Recent alerts\n• Quick actions\n\nIt\'s your central hub for compliance management.',
    suggestions: ['Go to dashboard', 'Compliance status', 'Alerts']
  }),
  verificationHelp: handleVerificationHelp,
  licenseHelp: handleLicenseHelp,
  orgInfo: handleOrgInfo,
  noticesHelp: async () => ({
    response: '📢 **Notices**\n\nNotices include:\n• Compliance changes\n• System updates\n• Regulatory changes\n• Deadline reminders\n\nCheck the Notices page for the latest updates.',
    suggestions: ['Go to notices', 'Dashboard']
  }),
  sectorPdfsHelp: async () => ({
    response: '📑 **Reference PDFs**\n\nSector-specific compliance reference documents are available for download. These PDFs provide detailed information about compliance requirements for your industry.',
    suggestions: ['Go to reference PDFs', 'Compliance status', 'Dashboard']
  }),
  howToHelp: handleHowToHelp,
  thanks: handleThanks,
  goodbye: handleGoodbye,
  navigate: handleNavigate,
  fallback: handleFallback
};

async function processMessage(message, user) {
  loadModels();
  const intent = matchIntent(message);
  const handler = HANDLERS[intent] || HANDLERS.fallback;
  const orgId = user.organization;

  try {
    const result = await handler(user, orgId, message);
    return { response: result.response, suggestions: result.suggestions || [], navigate: result.navigate || null };
  } catch (error) {
    console.error('Chatbot error:', error.message);
    return { response: 'Sorry, I encountered an error processing your request. Please try again.', suggestions: ['Dashboard', 'Compliance status'] };
  }
}

module.exports = { processMessage };
