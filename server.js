const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));


// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('CRITICAL ERROR: MONGO_URI is not set in backend .env file.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully to TripBuddy Database!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Please verify your MONGO_URI credentials, database name, and IP whitelist in MongoDB Atlas.');
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection disconnected. Mongoose will attempt to reconnect...');
});

connectDB();

// JWT Secret Helper
const JWT_SECRET = process.env.JWT_SECRET || 'tripbuddy_super_secret_key';

// --- AUTH ROUTES ---

// Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const newUser = new User({ name: name.trim(), email: cleanEmail, password });
    await newUser.save();
    
    res.status(201).json({ 
      message: 'User registered successfully!', 
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Audit check: Ensure email exists in MongoDB Atlas
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Audit check: Secure password comparison via bcrypt.compare (comparePassword method)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate JWT Token on verified match
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ 
      message: 'Login successful!', 
      token,
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transporter Helper Function
const createTransporter = () => {
  const mailUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
  const mailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS;
  const mailHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const mailPort = Number(process.env.SMTP_PORT) || 587;

  if (!mailUser || !mailPass || mailPass === 'app_password_here' || mailPass === 'your_gmail_16_digit_app_password') {
    throw new Error('Email credentials (EMAIL_USER & EMAIL_PASS / App Password) are not configured in backend environment variables.');
  }

  if (mailHost.includes('gmail') || process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass
      }
    });
  }

  return nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailPort === 465,
    auth: {
      user: mailUser,
      pass: mailPass
    }
  });
};

// Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    // 1. Generate secure 32-byte reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 2. Initialize & verify Nodemailer transporter
    let transporter;
    try {
      transporter = createTransporter();
      await transporter.verify();
    } catch (transporterErr) {
      console.error('Mail Transporter Configuration Error:', transporterErr.message);
      return res.status(500).json({ 
        error: `Email server error: ${transporterErr.message}. Please verify EMAIL_USER and EMAIL_PASS (App Password) in backend environment variables.` 
      });
    }

    // 3. Save token & 1-hour expiration timestamp in MongoDB Atlas
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // 4. Construct reset link URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://arusha-17.github.io/TripBuddy';
    const resetUrl = `${frontendUrl}/index.html?resetToken=${resetToken}`;

    const mailUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER;
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || `"TripBuddy Support" <${mailUser}>`,
      to: user.email,
      subject: 'TripBuddy — Password Reset Request',
      text: `Hello ${user.name},\n\nYou requested a password reset for your TripBuddy account.\n\nPlease click the following link to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.\n\nBest regards,\nTripBuddy Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0284c7; margin-bottom: 10px;">TripBuddy Password Reset</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested a password reset for your TripBuddy account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          <p style="font-size: 0.85rem; color: #64748b;">Or copy and paste this link into your browser:<br><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="font-size: 0.85rem; color: #64748b; margin-top: 20px;">This link will expire in 1 hour. If you did not request a password reset, no action is required.</p>
        </div>
      `
    };

    // 5. Send Email via Nodemailer & return success only when message is accepted by SMTP server
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email successfully sent to', user.email, 'MessageID:', info.messageId);

    return res.status(200).json({ 
      message: `Password reset link sent successfully to ${user.email}. Please check your inbox!` 
    });
  } catch (error) {
    console.error('Forgot password endpoint error:', error);
    return res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
});

// Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// --- TRIP ROUTES ---

// Create Trip
app.post('/api/trips', async (req, res) => {
  try {
    const { userId, destination, startDate, endDate, notes } = req.body;
    
    const newTrip = new Trip({ userId, destination, startDate, endDate, notes });
    await newTrip.save();

    res.status(201).json({ message: 'Trip created successfully!', trip: newTrip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trips for a User
app.get('/api/trips/:userId', async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Trip
app.delete('/api/trips/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});