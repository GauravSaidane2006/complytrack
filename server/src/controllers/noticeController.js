const Notice = require('../models/Notice');
const { generateNoticePDF } = require('../utils/noticePdfGenerator');
const path = require('path');
const fs = require('fs');

exports.getNotices = async (req, res, next) => {
  try {
    const filter = { organization: req.organizationId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.unread === 'true') filter.isRead = false;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [notices, total, unreadCount] = await Promise.all([
      Notice.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Notice.countDocuments(filter),
      Notice.countDocuments({ ...filter, isRead: false })
    ]);

    res.json({ notices, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json(notice);
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, organization: req.organizationId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json(notice);
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notice.updateMany(
      { organization: req.organizationId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notices marked as read.' });
  } catch (error) {
    next(error);
  }
};

exports.viewPDF = async (req, res, next) => {
  try {
    const notice = await Notice.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!notice) return res.status(404).json({ message: 'Notice not found.' });

    const noticesDir = path.join(__dirname, '../../notices');
    if (!fs.existsSync(noticesDir)) fs.mkdirSync(noticesDir, { recursive: true });

    const filePath = path.join(noticesDir, `notice_${notice._id}.pdf`);

    if (!fs.existsSync(filePath)) {
      await generateNoticePDF(notice, filePath);
      notice.pdfUrl = `/notices/notice_${notice._id}.pdf`;
      await notice.save();
    }

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': 'inline; filename="notice.pdf"'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

exports.downloadPDF = async (req, res, next) => {
  try {
    const notice = await Notice.findOne({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!notice) return res.status(404).json({ message: 'Notice not found.' });

    const noticesDir = path.join(__dirname, '../../notices');
    if (!fs.existsSync(noticesDir)) fs.mkdirSync(noticesDir, { recursive: true });

    const filePath = path.join(noticesDir, `notice_${notice._id}.pdf`);

    if (!fs.existsSync(filePath)) {
      await generateNoticePDF(notice, filePath);
      notice.pdfUrl = `/notices/notice_${notice._id}.pdf`;
      await notice.save();
    }

    const filename = `${notice.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(notice.createdAt).toISOString().split('T')[0]}.pdf`;
    res.download(filePath, filename);
  } catch (error) {
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndDelete({
      _id: req.params.id,
      organization: req.organizationId
    });

    if (!notice) return res.status(404).json({ message: 'Notice not found.' });

    if (notice.pdfUrl) {
      const filePath = path.join(__dirname, '../../', notice.pdfUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Notice deleted.' });
  } catch (error) {
    next(error);
  }
};
