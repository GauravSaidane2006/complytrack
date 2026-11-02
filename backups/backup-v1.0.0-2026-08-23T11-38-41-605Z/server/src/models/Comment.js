const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    compliance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Compliance',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    }
  },
  { timestamps: true }
);

commentSchema.index({ compliance: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
