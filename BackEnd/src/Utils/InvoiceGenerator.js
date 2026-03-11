// ===== src/utils/invoiceGenerator.js =====
const PDFDocument = require('pdfkit');
const { formatCurrency } = require('./Helpers');

/**
 * Advanced invoice generator with multiple format support
 * Creates professional invoices for bookings, payments, and services
 */
class InvoiceGenerator {
  /**
   * Generate HTML invoice
   */
  static generateHTML(booking, payment, user) {
    const invoiceNumber = this.generateInvoiceNumber();
    const dueDate = this.calculateDueDate(booking.createdAt);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0c14 0%, #0f172a 100%);
            color: #e2e8f0;
            line-height: 1.6;
            padding: 40px 20px;
          }
          
          .invoice-container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 40px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          
          .invoice-header {
            background: linear-gradient(135deg, #0f172a, #0a0c14);
            padding: 40px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            position: relative;
            overflow: hidden;
          }
          
          .invoice-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
          }
          
          .logo {
            font-family: 'Montserrat', sans-serif;
            font-size: 36px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -1px;
          }
          
          .logo .gold {
            background: linear-gradient(135deg, #d4af37, #f5d742);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .invoice-badge {
            padding: 12px 30px;
            background: linear-gradient(135deg, #d4af37, #f5d742);
            border-radius: 50px;
            color: #0a0c14;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
          }
          
          .header-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            position: relative;
            z-index: 1;
          }
          
          .company-info h2 {
            font-family: 'Montserrat', sans-serif;
            font-size: 24px;
            color: #ffffff;
            margin-bottom: 10px;
          }
          
          .company-info p {
            color: #94a3b8;
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .invoice-info {
            text-align: right;
          }
          
          .invoice-info .info-row {
            margin-bottom: 10px;
          }
          
          .invoice-info .label {
            color: #94a3b8;
            font-size: 14px;
            margin-right: 10px;
          }
          
          .invoice-info .value {
            color: #d4af37;
            font-weight: 600;
            font-size: 16px;
          }
          
          .bill-to {
            padding: 40px;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          }
          
          .bill-to h3 {
            font-family: 'Montserrat', sans-serif;
            color: #ffffff;
            font-size: 18px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .bill-to .name {
            color: #d4af37;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .bill-to p {
            color: #94a3b8;
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .items-section {
            padding: 40px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .items-table th {
            text-align: left;
            padding: 15px 10px;
            border-bottom: 2px solid #d4af37;
            color: #d4af37;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table td {
            padding: 15px 10px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
            color: #e2e8f0;
            font-size: 14px;
          }
          
          .items-table .amount {
            text-align: right;
            font-weight: 600;
            color: #d4af37;
          }
          
          .summary-section {
            padding: 30px 40px;
            background: rgba(255, 255, 255, 0.02);
            border-top: 1px solid rgba(212, 175, 55, 0.2);
            display: flex;
            justify-content: flex-end;
          }
          
          .summary-box {
            width: 350px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          }
          
          .summary-row.total {
            border-bottom: none;
            padding-top: 20px;
            font-size: 18px;
            font-weight: 700;
          }
          
          .summary-row.total .value {
            color: #d4af37;
            font-size: 24px;
          }
          
          .summary-label {
            color: #94a3b8;
          }
          
          .summary-value {
            color: #e2e8f0;
            font-weight: 600;
          }
          
          .payment-info {
            padding: 30px 40px;
            border-top: 1px solid rgba(212, 175, 55, 0.2);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .payment-item .label {
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .payment-item .value {
            color: #d4af37;
            font-weight: 600;
          }
          
          .payment-item .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-paid {
            background: rgba(0, 255, 136, 0.1);
            color: #00ff88;
            border: 1px solid #00ff88;
          }
          
          .status-pending {
            background: rgba(255, 187, 51, 0.1);
            color: #ffbb33;
            border: 1px solid #ffbb33;
          }
          
          .notes-section {
            padding: 30px 40px;
            border-top: 1px solid rgba(212, 175, 55, 0.2);
          }
          
          .notes-title {
            color: #d4af37;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          
          .notes-content {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .invoice-footer {
            padding: 30px 40px;
            background: linear-gradient(135deg, #0f172a, #0a0c14);
            border-top: 1px solid rgba(212, 175, 55, 0.2);
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="header-top">
              <div class="logo">CAR<span class="gold">EASE</span></div>
              <div class="invoice-badge">INVOICE</div>
            </div>
            
            <div class="header-grid">
              <div class="company-info">
                <h2>CAR EASE LLC</h2>
                <p>123 Luxury Lane, Beverly Hills, CA 90210</p>
                <p>+1 (800) 555-0123</p>
                <p>info@carease.com</p>
              </div>
              
              <div class="invoice-info">
                <div class="info-row">
                  <span class="label">Invoice Number:</span>
                  <span class="value">${invoiceNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Booking ID:</span>
                  <span class="value">${booking.bookingNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Date Issued:</span>
                  <span class="value">${new Date().toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span class="label">Due Date:</span>
                  <span class="value">${dueDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p class="name">${user?.firstName || booking.customerInfo?.firstName} ${user?.lastName || booking.customerInfo?.lastName}</p>
            <p>${user?.email || booking.customerInfo?.email}</p>
            <p>${user?.phone || booking.customerInfo?.phone}</p>
            ${user?.address ? `<p>${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}</p>` : ''}
          </div>
          
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.serviceType} Service</td>
                  <td>${this.getQuantity(booking)}</td>
                  <td>${formatCurrency(booking.pricing?.basePrice || 0)}</td>
                  <td class="amount">${formatCurrency(booking.pricing?.basePrice || 0)}</td>
                </tr>
                ${booking.extras?.map(extra => `
                  <tr>
                    <td>${extra.name}</td>
                    <td>${extra.quantity || 1}</td>
                    <td>${formatCurrency(extra.price || 0)}</td>
                    <td class="amount">${formatCurrency((extra.price || 0) * (extra.quantity || 1))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">${formatCurrency(booking.pricing?.subtotal || 0)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Tax (10%):</span>
                <span class="summary-value">${formatCurrency(booking.pricing?.tax || 0)}</span>
              </div>
              ${booking.pricing?.discount ? `
                <div class="summary-row">
                  <span class="summary-label">Discount:</span>
                  <span class="summary-value">-${formatCurrency(booking.pricing.discount)}</span>
                </div>
              ` : ''}
              <div class="summary-row total">
                <span class="summary-label">Total:</span>
                <span class="summary-value">${formatCurrency(booking.pricing?.total || 0)}</span>
              </div>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="payment-item">
              <div class="label">Payment Method</div>
              <div class="value">${payment?.method || 'Pending'}</div>
            </div>
            <div class="payment-item">
              <div class="label">Payment Status</div>
              <div class="value">
                <span class="status-${payment?.status || 'pending'}">${payment?.status || 'Pending'}</span>
              </div>
            </div>
            ${payment?.paidAt ? `
              <div class="payment-item">
                <div class="label">Payment Date</div>
                <div class="value">${new Date(payment.paidAt).toLocaleDateString()}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="notes-section">
            <div class="notes-title">Notes</div>
            <div class="notes-content">
              Thank you for choosing CAR EASE. Payment is due within 30 days. 
              Please include the invoice number with your payment.
            </div>
          </div>
          
          <div class="invoice-footer">
            <p>Thank you for your business. For questions regarding this invoice, please contact billing@carease.com</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} CAR EASE. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate PDF invoice
   */
  static async generatePDF(booking, payment, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];
        const invoiceNumber = this.generateInvoiceNumber();

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.rect(0, 0, doc.page.width, 150)
           .fill('#0f172a');

        doc.fontSize(30)
           .font('Helvetica-Bold')
           .fillColor('#d4af37')
           .text('CAR', 50, 50)
           .fillColor('#ffffff')
           .text('EASE', 50, 80);

        doc.fontSize(16)
           .fillColor('#ffffff')
           .text('INVOICE', 400, 50, { align: 'right' })
           .fontSize(10)
           .fillColor('#94a3b8')
           .text(`Invoice #: ${invoiceNumber}`, 400, 80, { align: 'right' })
           .text(`Date: ${new Date().toLocaleDateString()}`, 400, 95, { align: 'right' });

        // Company Info
        doc.fontSize(12)
           .fillColor('#ffffff')
           .text('CAR EASE LLC', 50, 170)
           .fontSize(8)
           .fillColor('#94a3b8')
           .text('123 Luxury Lane, Beverly Hills, CA 90210', 50, 185)
           .text('+1 (800) 555-0123', 50, 200)
           .text('info@carease.com', 50, 215);

        // Bill To
        doc.fontSize(12)
           .fillColor('#ffffff')
           .text('Bill To:', 300, 170)
           .fontSize(10)
           .fillColor('#e2e8f0')
           .text(`${user?.firstName || booking.customerInfo?.firstName} ${user?.lastName || booking.customerInfo?.lastName}`, 300, 185)
           .text(user?.email || booking.customerInfo?.email || '', 300, 200)
           .text(user?.phone || booking.customerInfo?.phone || '', 300, 215);

        // Items Table Header
        const tableTop = 280;
        doc.fontSize(10)
           .fillColor('#d4af37')
           .text('Description', 50, tableTop)
           .text('Qty', 300, tableTop)
           .text('Unit Price', 350, tableTop)
           .text('Amount', 450, tableTop, { align: 'right' });

        // Horizontal line
        doc.strokeColor('#d4af37')
           .lineWidth(1)
           .moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();

        // Items
        let y = tableTop + 30;
        
        // Main service
        doc.fillColor('#e2e8f0')
           .text(`${booking.serviceType} Service`, 50, y)
           .text(this.getQuantity(booking).toString(), 300, y)
           .text(formatCurrency(booking.pricing?.basePrice || 0), 350, y)
           .text(formatCurrency(booking.pricing?.basePrice || 0), 450, y, { align: 'right' });

        y += 20;

        // Extras
        if (booking.extras && booking.extras.length > 0) {
          booking.extras.forEach(extra => {
            const total = (extra.price || 0) * (extra.quantity || 1);
            doc.text(extra.name, 50, y)
               .text((extra.quantity || 1).toString(), 300, y)
               .text(formatCurrency(extra.price || 0), 350, y)
               .text(formatCurrency(total), 450, y, { align: 'right' });
            y += 20;
          });
        }

        // Summary
        const summaryY = Math.max(y + 30, 500);
        
        doc.fontSize(10)
           .fillColor('#94a3b8')
           .text('Subtotal:', 350, summaryY)
           .fillColor('#e2e8f0')
           .text(formatCurrency(booking.pricing?.subtotal || 0), 450, summaryY, { align: 'right' });

        doc.fillColor('#94a3b8')
           .text('Tax (10%):', 350, summaryY + 15)
           .fillColor('#e2e8f0')
           .text(formatCurrency(booking.pricing?.tax || 0), 450, summaryY + 15, { align: 'right' });

        if (booking.pricing?.discount) {
          doc.fillColor('#94a3b8')
             .text('Discount:', 350, summaryY + 30)
             .fillColor('#e2e8f0')
             .text(`-${formatCurrency(booking.pricing.discount)}`, 450, summaryY + 30, { align: 'right' });
        }

        // Total
        const totalY = summaryY + (booking.pricing?.discount ? 45 : 30);
        
        doc.lineWidth(1)
           .strokeColor('#d4af37')
           .moveTo(350, totalY - 5)
           .lineTo(550, totalY - 5)
           .stroke();

        doc.fontSize(12)
           .fillColor('#ffffff')
           .text('TOTAL:', 350, totalY)
           .fillColor('#d4af37')
           .fontSize(16)
           .text(formatCurrency(booking.pricing?.total || 0), 450, totalY, { align: 'right' });

        // Payment Info
        const paymentY = totalY + 50;
        
        doc.fontSize(10)
           .fillColor('#ffffff')
           .text('Payment Information', 50, paymentY);

        doc.fontSize(8)
           .fillColor('#94a3b8')
           .text('Method:', 50, paymentY + 15)
           .fillColor('#e2e8f0')
           .text(payment?.method || 'Pending', 120, paymentY + 15);

        doc.fillColor('#94a3b8')
           .text('Status:', 200, paymentY + 15)
           .fillColor(payment?.status === 'completed' ? '#00ff88' : '#ffbb33')
           .text(payment?.status || 'Pending', 250, paymentY + 15);

        if (payment?.paidAt) {
          doc.fillColor('#94a3b8')
             .text('Paid Date:', 350, paymentY + 15)
             .fillColor('#e2e8f0')
             .text(new Date(payment.paidAt).toLocaleDateString(), 410, paymentY + 15);
        }

        // Footer
        doc.fontSize(8)
           .fillColor('#94a3b8')
           .text('Thank you for choosing CAR EASE. For questions regarding this invoice, please contact billing@carease.com', 50, 700, { align: 'center' })
           .text(`© ${new Date().getFullYear()} CAR EASE. All rights reserved.`, 50, 715, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate text invoice
   */
  static generateText(booking, payment, user) {
    const invoiceNumber = this.generateInvoiceNumber();
    const lines = [];

    lines.push('='.repeat(60));
    lines.push('CAR EASE - INVOICE');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Invoice Number: ${invoiceNumber}`);
    lines.push(`Booking ID: ${booking.bookingNumber}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('');

    lines.push('BILL TO:');
    lines.push(`Name: ${user?.firstName || booking.customerInfo?.firstName} ${user?.lastName || booking.customerInfo?.lastName}`);
    lines.push(`Email: ${user?.email || booking.customerInfo?.email}`);
    lines.push(`Phone: ${user?.phone || booking.customerInfo?.phone}`);
    lines.push('');

    lines.push('ITEMS:');
    lines.push('-'.repeat(60));
    lines.push(`${booking.serviceType} Service`);
    lines.push(`  Quantity: ${this.getQuantity(booking)} x ${formatCurrency(booking.pricing?.basePrice || 0)} = ${formatCurrency(booking.pricing?.basePrice || 0)}`);

    if (booking.extras && booking.extras.length > 0) {
      booking.extras.forEach(extra => {
        const total = (extra.price || 0) * (extra.quantity || 1);
        lines.push(`${extra.name}`);
        lines.push(`  Quantity: ${extra.quantity || 1} x ${formatCurrency(extra.price || 0)} = ${formatCurrency(total)}`);
      });
    }

    lines.push('-'.repeat(60));
    lines.push('');

    lines.push('SUMMARY:');
    lines.push(`Subtotal: ${formatCurrency(booking.pricing?.subtotal || 0)}`);
    lines.push(`Tax: ${formatCurrency(booking.pricing?.tax || 0)}`);
    if (booking.pricing?.discount) {
      lines.push(`Discount: -${formatCurrency(booking.pricing.discount)}`);
    }
    lines.push(`Total: ${formatCurrency(booking.pricing?.total || 0)}`);
    lines.push('');

    lines.push('PAYMENT INFORMATION:');
    lines.push(`Method: ${payment?.method || 'Pending'}`);
    lines.push(`Status: ${payment?.status || 'Pending'}`);
    if (payment?.paidAt) {
      lines.push(`Paid Date: ${new Date(payment.paidAt).toLocaleDateString()}`);
    }
    lines.push('');

    lines.push('='.repeat(60));
    lines.push('Thank you for choosing CAR EASE!');
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * Generate invoice for email
   */
  static generateEmailInvoice(booking, payment, user) {
    const invoiceNumber = this.generateInvoiceNumber();
    const total = booking.pricing?.total || 0;

    return {
      subject: `Your CAR EASE Invoice #${invoiceNumber}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0c14; color: #e2e8f0; padding: 40px 20px; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: 'Montserrat', sans-serif; font-size: 32px; color: #ffffff; margin: 0;">
              CAR<span style="color: #d4af37;">EASE</span>
            </h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.03); border-radius: 20px; padding: 30px; border: 1px solid rgba(212,175,55,0.2);">
            <p style="color: #e2e8f0; margin-bottom: 20px;">Dear ${user?.firstName || booking.customerInfo?.firstName},</p>
            <p style="color: #94a3b8; margin-bottom: 20px;">Thank you for choosing CAR EASE. Your invoice is attached to this email.</p>
            
            <div style="background: rgba(212,175,55,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #94a3b8;">Invoice Number</p>
              <p style="margin: 5px 0 0; color: #d4af37; font-size: 20px; font-weight: 600;">${invoiceNumber}</p>
              
              <p style="margin: 15px 0 0; color: #94a3b8;">Total Amount</p>
              <p style="margin: 5px 0 0; color: #d4af37; font-size: 28px; font-weight: 700;">${formatCurrency(total)}</p>
            </div>
            
            <p style="color: #94a3b8; margin-bottom: 20px;">You can view your full invoice by logging into your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/invoices/${booking._id}" 
                 style="background: linear-gradient(135deg, #d4af37, #f5d742); color: #0a0c14; padding: 14px 35px; border-radius: 50px; text-decoration: none; font-weight: 600; display: inline-block;">
                View Invoice
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px;">
              If you have any questions about this invoice, please contact our billing team at billing@carease.com
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212,175,55,0.2); text-align: center; color: #94a3b8; font-size: 12px;">
            <p>© ${new Date().getFullYear()} CAR EASE. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Generate invoice number
   */
  static generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  /**
   * Calculate due date (30 days from issue)
   */
  static calculateDueDate(issueDate) {
    const due = new Date(issueDate);
    due.setDate(due.getDate() + 30);
    return due.toLocaleDateString();
  }

  /**
   * Get quantity based on service type
   */
  static getQuantity(booking) {
    if (booking.serviceType === 'rental') {
      const days = Math.ceil((new Date(booking.dates.endDate) - new Date(booking.dates.startDate)) / (1000 * 60 * 60 * 24));
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return '1';
  }

  /**
   * Generate invoice from booking data
   */
  static async generate(booking, payment, user, format = 'pdf') {
    switch (format) {
      case 'html':
        return this.generateHTML(booking, payment, user);
      case 'pdf':
        return await this.generatePDF(booking, payment, user);
      case 'text':
        return this.generateText(booking, payment, user);
      case 'email':
        return this.generateEmailInvoice(booking, payment, user);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

module.exports = InvoiceGenerator;