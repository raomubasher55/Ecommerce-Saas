const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Store', 'Admin']
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Store', 'Admin']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

messageSchema.pre('save', function(next) {
  if (!this.content || this.content.trim().length === 0) {
    next(new Error('Message content cannot be empty'));
  }
  next();
});

const chatSchema = new mongoose.Schema({
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'User'
  },
  stores: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'Store'
  },
  messages: [messageSchema],
  isAdminChat: {
    type: Boolean,
    default: false
  },
  storeName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Answered'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
