import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetDashboardSummaryQuery, useGetComplianceHealthQuery } from '../store/api/api'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const COLORS = { completed: '#34d399', pending: '#f59e0b', 'in-progress': '#f97316', overdue: '#f43f5e', waived: '#a8a29e' }

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-slate-300">{payload[0].value} items</p>
      </div>
    )
  }
  return null
}

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl">
        <p className="font-medium">{label}</p>
        <p className="text-slate-300">Score: {payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery()
  const { data: healthData, isLoading: healthLoading } = useGetComplianceHealthQuery()
  const [exportOpen, setExportOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (summaryLoading || healthLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const stats = summary?.stats || {}
  const pieData = [
    { name: 'Completed', value: stats.completed || 0, color: COLORS.completed, status: 'completed' },
    { name: 'Pending', value: stats.pending || 0, color: COLORS.pending, status: 'incomplete' },
    { name: 'In Progress', value: stats.inProgress || 0, color: COLORS['in-progress'], status: 'incomplete' },
    { name: 'Overdue', value: stats.overdue || stats.overdueItems || 0, color: COLORS.overdue, status: 'incomplete' },
    { name: 'Waived', value: stats.waived || 0, color: COLORS.waived, status: 'incomplete' }
  ].filter(d => d.value > 0)

  const complianceScore = stats.complianceScore || 0

  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook()
    wb.creator = 'ComplyTrack'
    wb.created = new Date()

    const ORANGE = 'F97316'
    const GREEN = '34D399'
    const GREEN_LIGHT = 'ECFDF5'
    const RED = 'F43F5E'
    const RED_LIGHT = 'FFF1F2'
    const AMBER = 'F59E0B'
    const AMBER_LIGHT = 'FFFBEB'
    const STONE = '78716C'
    const STONE_LIGHT = 'F5F5F4'
    const WHITE = 'FFFFFF'

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORANGE } }
    const headerFont = { bold: true, color: { argb: WHITE }, size: 11, name: 'Calibri' }
    const headerBorder = {
      bottom: { style: 'medium', color: { argb: 'EA580C' } }
    }

    const titleFont = { bold: true, size: 16, color: { argb: '1C1917' }, name: 'Calibri' }
    const subtitleFont = { size: 10, color: { argb: STONE }, name: 'Calibri', italic: true }

    const dataFont = { size: 11, color: { argb: '44403C' }, name: 'Calibri' }
    const dataBorder = {
      bottom: { style: 'thin', color: { argb: 'E7E5E4' } }
    }

    const applyHeaderRow = (sheet, row) => {
      row.eachCell((cell) => {
        cell.fill = headerFill
        cell.font = headerFont
        cell.border = headerBorder
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.height = 28
      })
    }

    const applyDataRows = (sheet, startRow, endRow) => {
      for (let r = startRow; r <= endRow; r++) {
        const row = sheet.getRow(r)
        const isAlt = (r - startRow) % 2 === 1
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.font = dataFont
          cell.border = dataBorder
          cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' }
          if (isAlt) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STONE_LIGHT } }
          }
        })
        row.height = 24
      }
    }

    const addSheetTitle = (sheet, title, subtitle) => {
      sheet.mergeCells('A1:F1')
      const titleCell = sheet.getCell('A1')
      titleCell.value = title
      titleCell.font = titleFont
      titleCell.alignment = { vertical: 'middle' }
      sheet.getRow(1).height = 36

      sheet.mergeCells('A2:F2')
      const subtitleCell = sheet.getCell('A2')
      subtitleCell.value = subtitle
      subtitleCell.font = subtitleFont
      subtitleCell.alignment = { vertical: 'middle' }
      sheet.getRow(2).height = 20
    }

    // === SUMMARY SHEET ===
    const summarySheet = wb.addWorksheet('Summary', {
      properties: { tabColor: { argb: ORANGE } },
      views: [{ state: 'frozen', ySplit: 4 }]
    })

    summarySheet.columns = [
      { width: 28 }, { width: 18 }, { width: 5 }, { width: 28 }, { width: 18 }, { width: 5 }
    ]

    addSheetTitle(summarySheet, 'Compliance Dashboard Report', `Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)

    // Key Metrics section
    summarySheet.getCell('A4').value = 'KEY METRICS'
    summarySheet.getCell('A4').font = { bold: true, size: 12, color: { argb: ORANGE }, name: 'Calibri' }
    summarySheet.getRow(4).height = 28

    const metrics = [
      ['Compliance Score', `${complianceScore}%`, 'Total Items', stats.total || 0],
      ['Completed', stats.completed || 0, 'Pending', stats.pending || 0],
      ['In Progress', stats.inProgress || 0, 'Overdue', stats.overdueItems || 0],
      ['Waived', stats.waived || 0, 'Unread Alerts', summary?.unreadAlerts || 0]
    ]

    const metricHeaderRow = summarySheet.getRow(5)
    metricHeaderRow.values = ['Metric', 'Value', '', 'Metric', 'Value', '']
    applyHeaderRow(summarySheet, metricHeaderRow)

    metrics.forEach((row, i) => {
      const dataRow = summarySheet.getRow(6 + i)
      dataRow.values = row
      dataRow.getCell(1).font = { ...dataFont, bold: true }
      dataRow.getCell(4).font = { ...dataFont, bold: true }
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = dataBorder
        cell.alignment = { vertical: 'middle', horizontal: colNumber <= 3 ? (colNumber === 1 ? 'left' : 'center') : (colNumber === 4 ? 'left' : 'center') }
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STONE_LIGHT } }
        }
      })
      dataRow.height = 24
    })

    // Highlight overdue in red
    const overdueRow = summarySheet.getRow(8)
    overdueRow.getCell(4).font = { ...dataFont, bold: true, color: { argb: RED } }

    // === STATUS BREAKDOWN SHEET ===
    const statusSheet = wb.addWorksheet('Status Breakdown', {
      properties: { tabColor: { argb: GREEN } },
      views: [{ state: 'frozen', ySplit: 5 }]
    })

    statusSheet.columns = [
      { width: 20 }, { width: 15 }, { width: 18 }, { width: 5 }, { width: 20 }, { width: 15 }
    ]

    addSheetTitle(statusSheet, 'Status Breakdown', 'Distribution of compliance items by status')

    statusSheet.getCell('A4').value = 'STATUS DISTRIBUTION'
    statusSheet.getCell('A4').font = { bold: true, size: 12, color: { argb: ORANGE }, name: 'Calibri' }

    const statusHeaderRow = statusSheet.getRow(5)
    statusHeaderRow.values = ['Status', 'Count', 'Percentage', '', 'Visual', '']
    applyHeaderRow(statusSheet, statusHeaderRow)

    const statusColors = {
      'Completed': GREEN,
      'Pending': AMBER,
      'In Progress': ORANGE,
      'Overdue': RED,
      'Waived': STONE
    }

    pieData.forEach((d, i) => {
      const row = statusSheet.getRow(6 + i)
      const pct = stats.total ? Math.round((d.value / stats.total) * 100) : 0
      row.values = [d.name, d.value, `${pct}%`, '', '', '']

      row.getCell(1).font = { ...dataFont, bold: true, color: { argb: statusColors[d.name] || '44403C' } }
      row.getCell(2).font = dataFont
      row.getCell(3).font = dataFont

      // Visual bar
      const barLength = Math.round(pct / 5)
      row.getCell(5).value = '█'.repeat(barLength) + '░'.repeat(20 - barLength)
      row.getCell(5).font = { size: 9, color: { argb: statusColors[d.name] || ORANGE }, name: 'Consolas' }

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = dataBorder
        cell.alignment = { vertical: 'middle', horizontal: colNumber <= 3 ? 'center' : 'left' }
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STONE_LIGHT } }
        }
      })
      row.height = 24
    })

    statusSheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: 5 + pieData.length, column: 3 }
    }

    // === MONTHLY TREND SHEET ===
    if (healthData?.score?.length > 0) {
      const trendSheet = wb.addWorksheet('Monthly Trend', {
        properties: { tabColor: { argb: 'F59E0B' } },
        views: [{ state: 'frozen', ySplit: 5 }]
      })

      trendSheet.columns = [
        { width: 18 }, { width: 15 }, { width: 18 }, { width: 5 }, { width: 20 }
      ]

      addSheetTitle(trendSheet, 'Monthly Compliance Trend', 'Compliance score trend over recent months')

      trendSheet.getCell('A4').value = 'TREND DATA'
      trendSheet.getCell('A4').font = { bold: true, size: 12, color: { argb: ORANGE }, name: 'Calibri' }

      const trendHeaderRow = trendSheet.getRow(5)
      trendHeaderRow.values = ['Month', 'Score', 'Rating', '', 'Status']
      applyHeaderRow(trendSheet, trendHeaderRow)

      healthData.score.forEach((d, i) => {
        const row = trendSheet.getRow(6 + i)
        const rating = d.score >= 80 ? 'Excellent' : d.score >= 60 ? 'Good' : d.score >= 40 ? 'Fair' : 'Poor'
        const ratingColor = d.score >= 80 ? GREEN : d.score >= 60 ? AMBER : d.score >= 40 ? 'F97316' : RED

        row.values = [d.month, d.score, `${d.score}%`, '', rating]

        row.getCell(1).font = { ...dataFont, bold: true }
        row.getCell(2).font = dataFont
        row.getCell(3).font = dataFont
        row.getCell(5).font = { ...dataFont, bold: true, color: { argb: ratingColor } }

        // Color code score cell
        row.getCell(2).fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: d.score >= 80 ? GREEN_LIGHT : d.score >= 50 ? AMBER_LIGHT : RED_LIGHT }
        }

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = dataBorder
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          if (i % 2 === 1 && colNumber !== 2) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STONE_LIGHT } }
          }
        })
        row.height = 24
      })

      trendSheet.autoFilter = {
        from: { row: 5, column: 1 },
        to: { row: 5 + healthData.score.length, column: 5 }
      }
    }

    // === UPCOMING DEADLINES SHEET ===
    if (summary?.upcomingDeadlines?.length > 0) {
      const deadlineSheet = wb.addWorksheet('Upcoming Deadlines', {
        properties: { tabColor: { argb: RED } },
        views: [{ state: 'frozen', ySplit: 5 }]
      })

      deadlineSheet.columns = [
        { width: 40 }, { width: 22 }, { width: 14 }, { width: 16 }, { width: 14 }
      ]

      addSheetTitle(deadlineSheet, 'Upcoming Deadlines', 'Compliance items due within the next 7 days')

      deadlineSheet.getCell('A4').value = 'DEADLINES'
      deadlineSheet.getCell('A4').font = { bold: true, size: 12, color: { argb: RED }, name: 'Calibri' }

      const deadlineHeaderRow = deadlineSheet.getRow(5)
      deadlineHeaderRow.values = ['Title', 'Law', 'Priority', 'Due Date', 'Days Left']
      applyHeaderRow(deadlineSheet, deadlineHeaderRow)

      const priorityColors = {
        critical: RED, high: 'F97316', medium: AMBER, low: STONE
      }

      summary.upcomingDeadlines.forEach((d, i) => {
        const row = deadlineSheet.getRow(6 + i)
        const daysLeft = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        const daysText = daysLeft <= 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft} days`
        const isUrgent = daysLeft <= 2

        row.values = [
          d.title,
          d.law,
          d.priority.charAt(0).toUpperCase() + d.priority.slice(1),
          new Date(d.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          daysText
        ]

        row.getCell(1).font = { ...dataFont, bold: true }
        row.getCell(2).font = dataFont
        row.getCell(3).font = { ...dataFont, bold: true, color: { argb: priorityColors[d.priority] || STONE } }
        row.getCell(4).font = dataFont
        row.getCell(5).font = { ...dataFont, bold: isUrgent, color: { argb: isUrgent ? RED : STONE } }

        if (isUrgent) {
          row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED_LIGHT } }
        }

        row.eachCell((cell, colNumber) => {
          cell.border = dataBorder
          cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' }
          if (i % 2 === 1 && !isUrgent) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STONE_LIGHT } }
          }
        })
        row.height = 26
      })

      deadlineSheet.autoFilter = {
        from: { row: 5, column: 1 },
        to: { row: 5 + summary.upcomingDeadlines.length, column: 5 }
      }
    }

    // === LAW DISTRIBUTION SHEET ===
    if (stats.lawDistribution?.length > 0) {
      const lawSheet = wb.addWorksheet('Law Distribution', {
        properties: { tabColor: { argb: 'A8A29E' } },
        views: [{ state: 'frozen', ySplit: 5 }]
      })

      lawSheet.columns = [
        { width: 28 }, { width: 15 }, { width: 15 }, { width: 5 }, { width: 30 }
      ]

      addSheetTitle(lawSheet, 'Law Distribution', 'Breakdown of compliance items by law category')

      lawSheet.getCell('A4').value = 'LAW BREAKDOWN'
      lawSheet.getCell('A4').font = { bold: true, size: 12, color: { argb: ORANGE }, name: 'Calibri' }

      const lawHeaderRow = lawSheet.getRow(5)
      lawHeaderRow.values = ['Law', 'Count', 'Percentage', '', 'Distribution']
      applyHeaderRow(lawSheet, lawHeaderRow)

      stats.lawDistribution.forEach((law, i) => {
        const row = lawSheet.getRow(6 + i)
        const pct = stats.total ? Math.round((law.count / stats.total) * 100) : 0
        const barLength = Math.round(pct / 5)

        row.values = [law._id, law.count, `${pct}%`, '', '█'.repeat(barLength) + '░'.repeat(20 - barLength)]

        row.getCell(1).font = { ...dataFont, bold: true }
        row.getCell(2).font = dataFont
        row.getCell(3).font = dataFont
        row.getCell(5).font = { size: 9, color: { argb: ORANGE }, name: 'Consolas' }

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = dataBorder
          cell.alignment = { vertical: 'middle', horizontal: colNumber <= 3 ? 'center' : 'left' }
          if (i % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STONE_LIGHT } }
          }
        })
        row.height = 24
      })

      lawSheet.autoFilter = {
        from: { row: 5, column: 1 },
        to: { row: 5 + stats.lawDistribution.length, column: 3 }
      }
    }

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `ComplianceDashboard_${new Date().toISOString().slice(0, 10)}.xlsx`)
    setExportOpen(false)
  }

  const exportToCSV = () => {
    const escapeCSV = (val) => {
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = []
    rows.push(['Section', 'Metric', 'Value', 'Percentage'])
    rows.push([])

    rows.push(['--- Summary ---', '', '', ''])
    rows.push(['Summary', 'Compliance Score', complianceScore, `${complianceScore}%`])
    rows.push(['Summary', 'Total Items', stats.total || 0, ''])
    rows.push(['Summary', 'Completed', stats.completed || 0, stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : ''])
    rows.push(['Summary', 'Pending', stats.pending || 0, stats.total ? `${Math.round((stats.pending / stats.total) * 100)}%` : ''])
    rows.push(['Summary', 'In Progress', stats.inProgress || 0, stats.total ? `${Math.round((stats.inProgress / stats.total) * 100)}%` : ''])
    rows.push(['Summary', 'Overdue', stats.overdueItems || 0, stats.total ? `${Math.round((stats.overdueItems / stats.total) * 100)}%` : ''])
    rows.push(['Summary', 'Waived', stats.waived || 0, stats.total ? `${Math.round((stats.waived / stats.total) * 100)}%` : ''])
    rows.push(['Summary', 'Unread Alerts', summary?.unreadAlerts || 0, ''])
    rows.push([])

    rows.push(['--- Status Breakdown ---', '', '', ''])
    pieData.forEach(d => {
      const pct = stats.total ? Math.round((d.value / stats.total) * 100) : 0
      rows.push(['Status', d.name, d.value, `${pct}%`])
    })
    rows.push([])

    if (healthData?.score?.length > 0) {
      rows.push(['--- Monthly Trend ---', '', '', ''])
      healthData.score.forEach(d => {
        const rating = d.score >= 80 ? 'Excellent' : d.score >= 60 ? 'Good' : d.score >= 40 ? 'Fair' : 'Poor'
        rows.push(['Trend', d.month, d.score, rating])
      })
      rows.push([])
    }

    if (summary?.upcomingDeadlines?.length > 0) {
      rows.push(['--- Upcoming Deadlines ---', '', '', ''])
      rows.push(['Deadlines', 'Title', 'Law', 'Priority', 'Due Date', 'Days Left'])
      summary.upcomingDeadlines.forEach(d => {
        const daysLeft = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        rows.push(['Deadlines', d.title, d.law, d.priority, new Date(d.dueDate).toLocaleDateString(), daysLeft <= 0 ? 'Today' : daysLeft])
      })
      rows.push([])
    }

    if (stats.lawDistribution?.length > 0) {
      rows.push(['--- Law Distribution ---', '', '', ''])
      stats.lawDistribution.forEach(l => {
        const pct = stats.total ? Math.round((l.count / stats.total) * 100) : 0
        rows.push(['Law', l._id, l.count, `${pct}%`])
      })
    }

    const csvContent = rows.map(r => r.map(escapeCSV).join(',')).join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `ComplianceDashboard_${new Date().toISOString().slice(0, 10)}.csv`)
    setExportOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your organization's compliance status</p>
        </div>
        <div className="relative self-start sm:self-auto" ref={dropdownRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
            <svg className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 overflow-hidden">
              <button
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">Export as Excel</p>
                  <p className="text-xs text-slate-400">.xlsx with multiple sheets</p>
                </div>
              </button>
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">Export as CSV</p>
                  <p className="text-xs text-slate-400">Import into Power BI</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Compliance Score"
          value={`${complianceScore}%`}
          color="primary"
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Compliance Status</h3>
            <button
              onClick={() => navigate('/compliance')}
              className="text-xs font-medium text-primary-500 hover:text-primary-700 transition-colors"
            >
              View all →
            </button>
          </div>
          {pieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                          style={{ cursor: 'pointer', outline: 'none' }}
                          onClick={() => navigate(`/compliance?status=${entry.status}`)}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-900">{complianceScore}%</span>
                  <span className="text-xs text-slate-400 mt-0.5">Score</span>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-col justify-center gap-x-5 gap-y-3 sm:gap-y-3.5">
                {pieData.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => navigate(`/compliance?status=${item.status}`)}
                    className="flex items-center gap-2.5 text-sm cursor-pointer group"
                  >
                    <span
                      className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white group-hover:ring-slate-100 transition-all"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-500 group-hover:text-slate-700 transition-colors">{item.name}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-12 text-center">No compliance data yet</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Monthly Trend</h3>
            <span className="text-xs text-slate-400">Compliance score over time</span>
          </div>
          {healthData?.score?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={healthData.score} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.06)' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {healthData.score.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.score >= 80 ? '#34d399' : entry.score >= 50 ? '#f59e0b' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm py-12 text-center">No trend data available</p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Upcoming Deadlines</h3>
            <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-500 rounded-full text-xs font-semibold">
              7 days
            </span>
          </div>
          {summary?.upcomingDeadlines?.length > 0 ? (
            <div className="space-y-2.5">
              {summary.upcomingDeadlines.map((item) => {
                const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysLeft <= 2
                return (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                      isUrgent
                        ? 'bg-danger-50/50 border-danger-200/60 hover:border-danger-300'
                        : 'bg-slate-50/80 border-transparent hover:bg-primary-50/50 hover:border-primary-200/60'
                    }`}
                    onClick={() => navigate(`/compliance/${item._id}`)}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${isUrgent ? 'bg-danger-400' : 'bg-primary-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.law}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
                      <StatusBadge status={item.priority} type="priority" />
                      <span className={`text-xs font-medium whitespace-nowrap ${isUrgent ? 'text-danger-500' : 'text-slate-400'}`}>
                        {daysLeft <= 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft} days`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-10 text-center">No upcoming deadlines</p>
          )}
        </div>

        {/* Law Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Law Distribution</h3>
            <span className="text-xs text-slate-400">{stats.lawDistribution?.length || 0} laws</span>
          </div>
          {stats.lawDistribution?.length > 0 ? (
            <div className="space-y-4">
              {stats.lawDistribution.map((law) => {
                const pct = stats.total ? Math.round((law.count / stats.total) * 100) : 0
                return (
                  <div key={law._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{law._id}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{pct}%</span>
                        <span className="text-sm font-semibold text-slate-900">{law.count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, #f97316, #f59e0b)`
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-10 text-center">No data to display</p>
          )}
        </div>
      </div>
    </div>
  )
}
