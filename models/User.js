const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'admin' or 'user'
    status: { type: String, default: 'pending' } // 'pending' or 'approved'
});

module.exports = mongoose.model('User', userSchema);