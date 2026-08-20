const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); // Ungaloda user model path check pannikonga
const app = express();

app.use(express.json());

// 1. Register Route (New users default-ah 'pending' status-oda iruppanga)
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered!" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role: role || 'user',
            status: 'pending' // Admin approval thevai
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registration Successful! Your account has been submitted for Admin Review." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Login Route (Fake login block + Admin approval check)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password!" });
        }

        // Check password match (Bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password!" });
        }

        // Check if user is approved by admin (Admin can login anytime)
        if (user.role !== 'admin' && user.status !== 'approved') {
            return res.status(403).json({ 
                success: false, 
                message: "Your account is pending admin review. You cannot login yet." 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Login successful!", 
            role: user.role,
            user: { name: user.fullName, email: user.email } 
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Admin Approve Route (To approve pending users)
app.post('/api/admin/approve/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { status: 'approved' }, 
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User approved successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});