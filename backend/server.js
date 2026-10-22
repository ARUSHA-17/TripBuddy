require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto'); // built-in Node.js module, no install needed
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(express.json());

// ─── Database Connection ───────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ─── Email Transporter (Nodemailer via Gmail SMTP) ─────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/register — New users default to 'pending' (requires admin approval)
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered.' });
    }

    const newUser = new User({ fullName, email, password });
    await newUser.save(); // bcrypt pre-save hook in User model hashes the password

    res.status(201).json({
      success: true,
      message:
        'Registration successful! Your account has been submitted for Admin Review.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    // Non-admin users must be approved before they can log in
    if (user.role !== 'admin' && user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin review. You cannot log in yet.',
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { name: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/approve/:id — Approve a pending user
app.post('/api/admin/approve/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    res
      .status(200)
      .json({ success: true, message: 'User approved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/forgot-password — Send password reset email
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    // Security: Always return same message whether email exists or not
    // This prevents attackers from discovering registered emails
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate a cryptographically secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save({ validateBeforeSave: false }); // skip validation, only updating token fields

    // Build the reset link pointing to the frontend
    const resetLink = `${process.env.FRONTEND_URL}?reset_token=${resetToken}`;

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'TripBuddy — Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">🌍 TripBuddy</h2>
          <h3 style="color: #111827;">Password Reset Request</h3>
          <p style="color: #374151;">Hi <strong>${user.fullName}</strong>,</p>
          <p style="color: #374151;">You requested a password reset. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="
              display: inline-block;
              padding: 14px 28px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            ">Reset My Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">⏱ This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">If you did not request this, you can safely ignore this email. Your account is secure.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">— The TripBuddy Support Team</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message:
        'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reset-password — Validate token and update password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Find user by token AND check token hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // $gt = greater than (not expired)
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.',
      });
    }

    // Update password and clear the reset token fields
    user.password = newPassword; // bcrypt pre-save hook will hash this automatically
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 TripBuddy server running on port ${PORT}`));