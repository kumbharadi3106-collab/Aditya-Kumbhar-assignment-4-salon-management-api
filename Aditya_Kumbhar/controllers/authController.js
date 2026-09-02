const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
require('dotenv').config();

// ---------- POST /register ----------
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      return res.status(500).json({ error: 'Database error while checking user.', details: lookupError.message });
    }
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password: hashedPassword
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select('id, username, email')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to register user.', details: error.message });
    }

    return res.status(201).json({ message: 'User registered successfully.', user: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error during registration.', details: err.message });
  }
}

// ---------- POST /login ----------
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Database error during login.', details: error.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'No user found with this email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error during login.', details: err.message });
  }
}

module.exports = { register, login };
