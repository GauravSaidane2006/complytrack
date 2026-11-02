import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetCompanyReportQuery } from '../store/api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COMPANY_TYPE_LABELS = {
  private_limited: 'Private Limited (Pvt Ltd)',
  public_limited: 'Public Limited (Ltd)',
  one_person: 'One Person Company (OPC)',
  llp: 'Limited Liability Partnership (LLP)',
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership Firm',
  huf: 'Hindu Undivided Family (HUF)',
  society: 'Society / Trust / NGO',
};

const SECTOR_LABELS = { service: 'Service', manufacturing: 'Manufacturing', trading: 'Trading' };

const STATUS_COLORS = {
  pending: 'bg-warning-100 text-warning-700',
  'in-progress': 'bg-primary-100 text-primary-700',
  completed: 'bg-success-100 text-success-700',
  overdue: 'bg-danger-100 text-danger-600',
};

const ROLE_COLORS = {
  admin: 'bg-primary-100 text-primary-600',
  manager: 'bg-primary-100 text-primary-700',
  user: 'bg-slate-100 text-slate-700',
};

export default function CompanyReport() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: report, isLoading, error } = useGetCompanyReportQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <p className="text-danger-500 font-medium">Failed to load company report.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const { company, users, compliance, alerts, upcomingDeadlines } = report;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Company Report</h1>
          <p className="text-slate-500 mt-1">Overview of your organization's status and compliance</p>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
                <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-bold">{company.companyId}</span>
              </div>
              <p className="text-slate-500 text-sm">{SECTOR_LABELS[company.sector]} — {company.industry}</p>
              <p className="text-slate-400 text-xs mt-1">
                {COMPANY_TYPE_LABELS[company.companyType] || company.companyType} • 
                Registered {new Date(company.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                company.verificationStatus === 'verified' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
              }`}>
                {company.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                company.complianceSetupComplete ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {company.complianceSetupComplete ? 'Compliance Setup Done' : 'Setup Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5 text-center">
            <div className="text-3xl font-bold text-primary-500">{compliance.total}</div>
            <div className="text-sm text-slate-500 mt-1">Total Compliances</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5 text-center">
            <div className="text-3xl font-bold text-success-600">{compliance.score}%</div>
            <div className="text-sm text-slate-500 mt-1">Compliance Score</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5 text-center">
            <div className="text-3xl font-bold text-danger-500">{compliance.overdue}</div>
            <div className="text-sm text-slate-500 mt-1">Overdue Items</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-5 text-center">
            <div className="text-3xl font-bold text-warning-600">{alerts.unread}</div>
            <div className="text-sm text-slate-500 mt-1">Unread Alerts</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Compliance Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Compliance Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Pending', count: compliance.pending, color: 'bg-warning-400' },
                { label: 'In Progress', count: compliance.inProgress, color: 'bg-blue-400' },
                { label: 'Completed', count: compliance.completed, color: 'bg-success-400' },
                { label: 'Overdue', count: compliance.overdue, color: 'bg-danger-400' },
                { label: 'Critical Priority', count: compliance.critical, color: 'bg-primary-500' },
                { label: 'High Priority', count: compliance.high, color: 'bg-primary-300' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Users Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Users ({users.total})</h3>
            <div className="space-y-3">
              {[
                { label: 'Active Users', count: users.active, color: 'bg-success-400' },
                { label: 'Admins', count: users.admins, color: 'bg-primary-400' },
                { label: 'Managers', count: users.managers, color: 'bg-blue-400' },
                { label: 'Regular Users', count: users.regular, color: 'bg-slate-400' },
                { label: 'Joined Last 30 Days', count: users.recentJoins, color: 'bg-primary-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Team Members</h3>
            {(user?.role === 'admin' || user?.isDev) && (
              <button
                onClick={() => navigate('/users')}
                className="text-sm text-primary-500 hover:text-primary-700 font-semibold"
              >
                Manage Users →
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.list.map((u, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 text-sm font-medium text-slate-900">{u.name}</td>
                    <td className="py-3 text-sm text-slate-500">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Upcoming Deadlines (Next 30 Days)</h3>
            <div className="space-y-2">
              {upcomingDeadlines.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.law}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(item.dueDate).toLocaleDateString('en-IN')}
                    </p>
                    <span className={`text-xs font-semibold ${STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-700'} px-2 py-0.5 rounded`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
