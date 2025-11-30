// server/index.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Supabase admin client (service_role key) - RUN ONLY ON SERVER
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// nodemailer transporter (Gmail SMTP with App Password recommended)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


// helper: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint
app.post('/api/send-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // generate OTP and store hashed
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // insert into password_resets
    const { error: insertErr } = await supabaseAdmin
      .from('password_resets')
      .insert([{ email: email.toLowerCase(), otp_hash: otpHash, expires_at }]);

    if (insertErr) {
      console.error('insertErr', insertErr);
      return res.status(500).json({ error: 'db insert failed' });
    }

    // send email
    const mail = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP to reset password',
      text: `Your OTP to reset password is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP to reset password is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    };

    await transporter.sendMail(mail);

    return res.json({ ok: true, message: 'OTP sent if email exists' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// Verify OTP and reset password
app.post('/api/verify-otp-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'email, otp and newPassword required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // get latest unused OTP record for this email
    const { data: rows, error: qErr } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (qErr) {
      console.error(qErr);
      return res.status(500).json({ error: 'db error' });
    }
    if (!rows || rows.length === 0) return res.status(400).json({ error: 'OTP invalid or expired' });

    const row = rows[0];
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired' });

    const match = await bcrypt.compare(otp, row.otp_hash);
    if (!match) return res.status(400).json({ error: 'OTP invalid' });

    // mark OTP used
    await supabaseAdmin
      .from('password_resets')
      .update({ used: true })
      .eq('id', row.id);

    // find user id by listing users (small projects ok). For large userbase create public.profiles mapping
    const { data: userListRes, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) {
      console.error('listErr', listErr);
      return res.status(500).json({ error: 'could not list users' });
    }
    const users = userListRes.users || userListRes; // depends on SDK version
    const user = (users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase());

    if (!user) return res.status(400).json({ error: 'No account found for this email' });

    // update the user's password via admin API
    const { data: updatedUser, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateErr) {
      console.error('updateErr', updateErr);
      return res.status(500).json({ error: 'could not update password' });
    }

    return res.json({ ok: true, message: 'Password updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.listen(PORT, () => {
  console.log('Server listening on', PORT);
});
