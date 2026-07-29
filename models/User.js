const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  role: { type: String, default: 'user' },  // 'user' or 'reporter'
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  drafts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  categories: [{ type: String }],  // For categories like 'Sports', 'Politics'
  analytics: {
    views: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  collaborations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
