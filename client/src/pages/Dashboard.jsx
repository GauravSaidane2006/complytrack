import { useNavigate } from 'react-router-dom'
import { useGetDashboardSummaryQuery, useGetComplianceHealthQuery } from '../store/api/api'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const COLORS = { completed: '#34d399', pending: '#f59e0b', 'in-progress': '#f97316', overdue: '#f43f5e', waived: '#a8a29e' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery()
  const { data: healthData, isLoading: healthLoading } = useGetComplianceHealthQuery()

  if (summaryLoading || healthLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const stats = summary?.stats || {}
  const pieData = [
    { name: 'Completed', value: stats.completed || 0, color: COLORS.completed },
    { name: 'Pending', value: stats.pending || 0, color: COLORS.pending },
    { name: 'In Progress', value: stats.inProgress || 0, color: COLORS['in-progress'] },
    { name: 'Overdue', value: stats.overdue || stats.overdueItems || 0, color: COLORS.overdue },
    { name: 'Waived', value: stats.waived || 0, color: COLORS.waived }
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Overview of your organization's compliance status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Compliance Score"
          value={`${stats.complianceScore || 0}%`}
          color="orange"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          title="Total Items"
          value={stats.total || 0}
          color="teal"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          subtitle={`${stats.completed || 0} completed`}
        />
        <StatCard
          title="Overdue"
          value={stats.overdueItems || 0}
          color="rose"
          icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          onClick={() => navigate('/compliance?status=overdue')}
        />
        <StatCard
          title="Unread Alerts"
          value={summary?.unreadAlerts || 0}
          color="amber"
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          onClick={() => navigate('/alerts')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-5">Compliance Status</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200} minWidth={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2} stroke="#fff">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 sm:mt-0">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-stone-600">{item.name}</span>
                      <span className="font-semibold text-stone-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-stone-400 text-sm py-8 text-center">No compliance data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-5">Monthly Compliance Trend</h3>
          {healthData?.score?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={healthData.score}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip />
                <Bar dataKey="score" fill="url(#orangeGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-stone-400 text-sm py-8 text-center">No trend data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-5">Upcoming Deadlines (7 days)</h3>
          {summary?.upcomingDeadlines?.length > 0 ? (
            <div className="space-y-3">
              {summary.upcomingDeadlines.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl cursor-pointer hover:bg-orange-50/60 transition-colors border border-transparent hover:border-orange-200/60"
                  onClick={() => navigate(`/compliance/${item._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.law}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <StatusBadge status={item.priority} type="priority" />
                    <span className="text-xs text-stone-500 whitespace-nowrap">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-sm py-8 text-center">No upcoming deadlines</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-stone-900 mb-5">Law Distribution</h3>
          {stats.lawDistribution?.length > 0 ? (
            <div className="space-y-3">
              {stats.lawDistribution.map((law) => (
                <div key={law._id} className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">{law._id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-stone-100 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(law.count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-stone-900 w-8 text-right">{law.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-sm py-8 text-center">No data to display</p>
          )}
        </div>
      </div>
    </div>
  )
}
