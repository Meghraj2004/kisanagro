import nodemailer from 'nodemailer';
import { Inquiry } from '@/types';

// Create transporter with better configuration
const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!user || !pass) {
    console.error('SMTP credentials missing in environment variables');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

export async function sendInquiryEmail(inquiry: Inquiry) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('Failed to create email transporter');
    return false;
  }

  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (verifyError: any) {
    console.error('SMTP verification failed:', {
      message: verifyError.message,
      code: verifyError.code,
    });
    return false;
  }

  try {
    // Generate product details HTML - supports multiple formats
    let productDetailsHtml = '';
    
    if (inquiry.selectedProducts && inquiry.selectedProducts.length > 0) {
      // New multiple products format (from updated modals)
      const productsHtml = inquiry.selectedProducts.map((product, index) => `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Product ${index + 1}</h4>
          <p style="margin: 5px 0;"><strong>Product:</strong> ${product.productTitle}</p>
          ${product.category ? `<p style="margin: 5px 0;"><strong>📂 Category:</strong> ${product.category}</p>` : ''}
          <p style="margin: 5px 0;"><strong>🍎 Fruit Type:</strong> ${product.fruitName}</p>
          <p style="margin: 5px 0;"><strong>📏 Size Required:</strong> ${product.size}</p>
          <p style="margin: 5px 0;"><strong>📦 Quantity:</strong> ${product.quantity}</p>
          ${product.price ? `<p style="margin: 5px 0;"><strong>💰 Price:</strong> ₹${product.price}</p>` : ''}
        </div>
      `).join('');
      
      productDetailsHtml = `
        <div style="margin: 15px 0;">
          <h3 style="margin: 0 0 15px 0; color: #92400e;">🛍️ Product Details (${inquiry.selectedProducts.length} items)</h3>
          ${productsHtml}
        </div>
      `;
    } else if (inquiry.products && inquiry.products.length > 0) {
      // Legacy multiple products format
      const productsHtml = inquiry.products.map((product, index) => `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Product ${index + 1}</h4>
          <p style="margin: 5px 0;"><strong>Product:</strong> ${product.productTitle}</p>
          <p style="margin: 5px 0;"><strong>🍎 Fruit Type:</strong> ${product.fruitName}</p>
          <p style="margin: 5px 0;"><strong>📏 Size Required:</strong> ${product.size}</p>
          <p style="margin: 5px 0;"><strong>📦 Quantity:</strong> ${product.quantity}</p>
        </div>
      `).join('');
      
      productDetailsHtml = `
        <div style="margin: 15px 0;">
          <h3 style="margin: 0 0 15px 0; color: #92400e;">🛍️ Product Details (${inquiry.products.length} items)</h3>
          ${productsHtml}
        </div>
      `;
    } else if (inquiry.productTitle) {
      // Single product inquiry (legacy)
      productDetailsHtml = `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">🛍️ Product Details</h3>
          <p style="margin: 5px 0;"><strong>Product:</strong> ${inquiry.productTitle}</p>
          ${inquiry.fruitName ? `<p style="margin: 5px 0;"><strong>🍎 Fruit Type:</strong> ${inquiry.fruitName}</p>` : ''}
          ${inquiry.size ? `<p style="margin: 5px 0;"><strong>📏 Size Required:</strong> ${inquiry.size}</p>` : ''}
          ${inquiry.quantity ? `<p style="margin: 5px 0;"><strong>📦 Quantity:</strong> ${inquiry.quantity}</p>` : ''}
        </div>
      `;
    }

    const mailOptions = {
      from: `"KisanAgro Inquiry" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: inquiry.email,
      subject: inquiry.selectedProducts && inquiry.selectedProducts.length > 0
        ? `🔔 New Inquiry from ${inquiry.name} - ${inquiry.selectedProducts.length} Products`
        : inquiry.products && inquiry.products.length > 0 
        ? `🔔 New Inquiry from ${inquiry.name} - ${inquiry.products.length} Products` 
        : `🔔 New Inquiry from ${inquiry.name}${inquiry.productTitle ? ` - ${inquiry.productTitle}` : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">📧 New Customer Inquiry</h1>
              <p style="margin: 10px 0 0 0; color: #dcfce7; font-size: 14px;">KisanAgro - Inquiry Management</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- Customer Details -->
              <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
                <h2 style="margin: 0 0 15px 0; color: #15803d; font-size: 18px;">👤 Customer Information</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Name:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${inquiry.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${inquiry.email}" style="color: #2563eb; text-decoration: none;">${inquiry.email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Phone:</td>
                    <td style="padding: 8px 0;"><a href="tel:${inquiry.phone}" style="color: #2563eb; text-decoration: none;">${inquiry.phone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">City:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${inquiry.city}</td>
                  </tr>
                </table>
              </div>

              ${productDetailsHtml}

              <!-- Message -->
              ${inquiry.message ? `
              <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #6b7280;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">💬 Customer Message</h3>
                <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
              </div>
              ` : ''}

              <!-- Timestamp -->
              <div style="padding: 15px; background: #eff6ff; border-radius: 8px; text-align: center; border: 1px dashed #3b82f6;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>⏰ Received:</strong> ${new Date(inquiry.createdAt).toLocaleString('en-IN', { 
                    dateStyle: 'full', 
                    timeStyle: 'short',
                    timeZone: 'Asia/Kolkata'
                  })}
                </p>
              </div>

              <!-- Action Buttons -->
              <div style="margin-top: 30px; text-align: center;">
                <a href="mailto:${inquiry.email}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 5px;">
                  ✉️ Reply via Email
                </a>
                <a href="tel:${inquiry.phone}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 5px;">
                  📞 Call Customer
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated email from KisanAgro Inquiry System
              </p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                Please respond to the customer as soon as possible
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    return false;
  }
}
