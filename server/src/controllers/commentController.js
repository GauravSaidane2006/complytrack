const Comment = require('../models/Comment');
const Compliance = require('../models/Compliance');
const { emitToOrg } = require('../utils/socketHelper');

exports.getComments = async (req, res, next) => {
  try {
    const compliance = await Compliance.findOne({
      _id: req.params.complianceId,
      organization: req.organizationId
    });
    if (!compliance) return res.status(404).json({ message: 'Compliance item not found.' });

    const comments = await Comment.find({ compliance: req.params.complianceId })
      .populate('user', 'name email role')
      .sort('-createdAt');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const compliance = await Compliance.findOne({
      _id: req.params.complianceId,
      organization: req.organizationId
    });
    if (!compliance) return res.status(404).json({ message: 'Compliance item not found.' });

    const comment = await Comment.create({
      compliance: req.params.complianceId,
      user: req.user._id,
      text: req.body.text
    });

    const populated = await comment.populate('user', 'name email role');

    emitToOrg(req.organizationId, 'comment:created', {
      _id: populated._id,
      complianceId: req.params.complianceId,
      user: { _id: populated.user._id, name: populated.user.name },
      text: populated.text,
      createdAt: populated.createdAt
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const compliance = await Compliance.findOne({
      _id: comment.compliance,
      organization: req.organizationId
    });
    if (!compliance) return res.status(404).json({ message: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    emitToOrg(req.organizationId, 'comment:deleted', {
      _id: req.params.id,
      complianceId: comment.compliance.toString()
    });

    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
};
