const Compliance = require('../models/Compliance');
const Report = require('../models/Report');
const { generatePDF } = require('../utils/pdfGenerator');
const { generateExcel } = require('../utils/excelGenerator');
const path = require('path');
const fs = require('fs');

exports.getReports = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.format) filter.format = req.query.format;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('generatedBy', 'name')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Report.countDocuments(filter)
    ]);

    res.json({ reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      organization: req.organizationId
    }).populate('generatedBy', 'name');

    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    const { type, format, filters } = req.body;
    const orgId = req.organizationId;

    const query = { organization: orgId };
    if (filters) {
      if (filters.status) query.status = { $in: filters.status };
      if (filters.law) query.law = { $in: filters.law };
      if (filters.priority) query.priority = { $in: filters.priority };
      if (filters.assignedTo) query.assignedTo = { $in: filters.assignedTo };
      if (filters.dateFrom || filters.dateTo) {
        query.dueDate = {};
        if (filters.dateFrom) query.dueDate.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.dueDate.$lte = new Date(filters.dateTo);
      }
    }

    const complianceItems = await Compliance.find(query)
      .populate('assignedTo', 'name email')
      .populate('completedBy', 'name');

    const totalItems = complianceItems.length;
    const completed = complianceItems.filter(i => i.status === 'completed').length;
    const pending = complianceItems.filter(i => i.status === 'pending').length;
    const overdue = complianceItems.filter(i => i.status === 'overdue').length;
    const inProgress = complianceItems.filter(i => i.status === 'in-progress').length;
    const complianceScore = totalItems > 0 ? Math.round(((completed) / totalItems) * 100) : 0;

    const reportData = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Compliance Report - ${new Date().toLocaleDateString()}`,
      type,
      format: format || 'pdf',
      organization: orgId,
      generatedBy: req.user._id,
      filters: filters || {},
      summary: { totalItems, completed, pending, overdue, inProgress, complianceScore },
      items: complianceItems,
      dateRange: {
        from: filters?.dateFrom || complianceItems[0]?.createdAt || new Date(),
        to: filters?.dateTo || new Date()
      }
    };

    const report = await Report.create(reportData);

    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    if (format === 'excel') {
      const filePath = path.join(reportsDir, `report_${report._id}.xlsx`);
      await generateExcel(complianceItems, filePath);
      report.fileUrl = `/reports/report_${report._id}.xlsx`;
    } else {
      const filePath = path.join(reportsDir, `report_${report._id}.pdf`);
      await generatePDF(reportData, filePath);
      report.fileUrl = `/reports/report_${report._id}.pdf`;
    }

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

exports.downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!report || !report.fileUrl) {
      return res.status(404).json({ message: 'Report or file not found.' });
    }

    const filePath = path.join(__dirname, '../../', report.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server.' });
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!report) return res.status(404).json({ message: 'Report not found.' });

    if (report.fileUrl) {
      const filePath = path.join(__dirname, '../../', report.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Report deleted.' });
  } catch (error) {
    next(error);
  }
};
