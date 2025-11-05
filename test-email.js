// Test SMTP Configuration
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

async function testEmail() {
  console.log('Testing SMTP Configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('\n1. Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    console.log('\n2. Sending test email...');
    const info = await transporter.sendMail({
      from: `"KisanAgro Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Test Email from KisanAgro',
      html: '<h1>Test Email</h1><p>If you receive this, your SMTP is working correctly!</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox at:', process.env.ADMIN_EMAIL);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetails:', {
      code: error.code,
      command: error.command,
      response: error.response,
    });
  }
}

testEmail();
