import nodemailer from 'nodemailer';
import path from 'path';

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Use App Password, NOT actual password
  },
});

export const sendNewOrderAlertToAdmin = async (orderData: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="Dhund Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #0f172a;">New Order Received! 🚀</h2>
        <p>A new order has been placed on the store.</p>
        
        <div style="background-color: #f8f9fc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Customer:</strong> ${orderData.firstName} ${orderData.lastName}</p>
          <p><strong>Email:</strong> ${orderData.email}</p>
          <p><strong>Phone:</strong> ${orderData.phone}</p>
          <p><strong>Total Amount:</strong> Rs. ${orderData.totalAmount}</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">Log in to your admin dashboard to view the full details and process this order.</p>
      </div>
    `;

    const text = `New Order Received!\n\nOrder ID: ${orderData.orderId}\nCustomer: ${orderData.firstName} ${orderData.lastName}\nEmail: ${orderData.email}\nPhone: ${orderData.phone}\nTotal Amount: Rs. ${orderData.totalAmount}\n\nLog in to your admin dashboard to view the full details and process this order.`;

    await transporter.sendMail({
      from: `"Dhund Store" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send alert to admin
      subject: `New Sale! ${orderData.orderId} - Rs. ${orderData.totalAmount}`,
      text,
      html,
      attachments: [{
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'logo'
      }]
    });
  } catch (error) {
    console.error('Failed to send admin order alert email:', error);
  }
};

export const sendOrderConfirmationToCustomer = async (orderData: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
  try {
    let itemsHtml = orderData.items.map((item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name} <br><span style="font-size:12px; color:#64748b;">Size: ${item.size || 'N/A'}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. ${item.price}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="Dhund Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #0f172a; text-align: center;">Thank You For Your Order!</h2>
        <p>Hi ${orderData.firstName},</p>
        <p>We've received your order and are getting it ready for you. Your order ID is <strong>${orderData.orderId}</strong>.</p>
        
        <h3 style="margin-top: 30px; border-bottom: 2px solid #0f172a; padding-bottom: 10px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="text-align: center; padding: 10px; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="text-align: right; padding: 10px; border-bottom: 2px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Grand Total:</td>
              <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">Rs. ${orderData.totalAmount}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background-color: #f8f9fc; padding: 15px; border-radius: 6px; margin: 30px 0;">
          <h4 style="margin-top: 0;">Shipping Details</h4>
          <p style="margin-bottom: 0;">${orderData.address}, ${orderData.apartment ? orderData.apartment + ', ' : ''}${orderData.city}, ${orderData.postalCode}</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 40px;">
          Payment Method: Cash on Delivery<br>
          If you have any questions, simply reply to this email.
        </p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <img src="cid:logo" alt="Dhund Stamp" style="max-width: 80px; opacity: 0.7;" />
          <p style="color: #94a3b8; font-size: 12px; margin-top: 10px; letter-spacing: 1px; text-transform: uppercase;">Dhund Unisex Clothing Brand</p>
        </div>
      </div>
    `;

    const itemsText = orderData.items.map((item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => `- ${item.name} (Size: ${item.size || 'N/A'}) x${item.quantity}: Rs. ${item.price}`).join('\n');
    const text = `Thank You For Your Order, ${orderData.firstName}!\n\nWe've received your order and are getting it ready for you. Your order ID is ${orderData.orderId}.\n\nOrder Summary:\n${itemsText}\n\nGrand Total: Rs. ${orderData.totalAmount}\n\nShipping Details:\n${orderData.address}, ${orderData.apartment ? orderData.apartment + ', ' : ''}${orderData.city}, ${orderData.postalCode}\n\nPayment Method: Cash on Delivery\n\nIf you have any questions, simply reply to this email.`;

    await transporter.sendMail({
      from: `"Dhund Store" <${process.env.EMAIL_USER}>`,
      to: orderData.email,
      subject: `Order Confirmation - ${orderData.orderId}`,
      text,
      html,
      attachments: [{
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'logo'
      }]
    });
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
  }
};

export const sendOrderStatusUpdate = async (orderId: string, email: string, firstName: string, newStatus: string) => {
  try {
    const statusText = newStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : newStatus.replace(/_/g, ' ');
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="Dhund Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #0f172a; text-align: center;">Order Update</h2>
        <p>Hi ${firstName},</p>
        <p>Your order <strong>${orderId}</strong> has been updated.</p>
        
        <div style="background-color: #f8f9fc; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0; color: #0f172a; text-transform: uppercase;">New Status: ${statusText}</h3>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
          Thank you for shopping with us!
        </p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <img src="cid:logo" alt="Dhund Stamp" style="max-width: 80px; opacity: 0.7;" />
          <p style="color: #94a3b8; font-size: 12px; margin-top: 10px; letter-spacing: 1px; text-transform: uppercase;">Dhund Unisex Clothing Brand</p>
        </div>
      </div>
    `;

    const text = `Order Update\n\nHi ${firstName},\n\nYour order ${orderId} has been updated.\n\nNew Status: ${statusText}\n\nThank you for shopping with us!`;

    await transporter.sendMail({
      from: `"Dhund Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Update on your order ${orderId}`,
      text,
      html,
      attachments: [{
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'logo'
      }]
    });
  } catch (error) {
    console.error('Failed to send order status update email:', error);
  }
};
