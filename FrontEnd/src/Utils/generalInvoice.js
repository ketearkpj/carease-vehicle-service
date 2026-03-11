// ===== src/Utils/generateInvoice.js =====
/**
 * INVOICE GENERATOR - GOD MODE
 * Comprehensive invoice generation with multiple formats
 * Supports: PDF, HTML, Email templates, Print-friendly
 */

import { formatCurrency, formatDate, formatDateTime } from './format';
import { COMPANY_INFO, TAX_RATE } from './constants';

// ===== INVOICE TEMPLATES =====

/**
 * Generate HTML invoice
 * @param {Object} data - Invoice data
 * @returns {string} - HTML string
 */
export const generateHTMLInvoice = (data) => {
  const {
    invoiceNumber,
    bookingId,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items = [],
    subtotal = 0,
    tax = subtotal * TAX_RATE,
    discount = 0,
    total = subtotal + tax - discount,
    paymentMethod,
    paymentStatus,
    paymentDate,
    dueDate,
    notes,
    terms,
    companyInfo = COMPANY_INFO
  } = data;

  const currentDate = formatDate(new Date(), { format: 'long' });
  const formattedDueDate = dueDate ? formatDate(dueDate, { format: 'long' }) : 'N/A';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0c14;
            color: #e2e8f0;
            line-height: 1.6;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 1000px;
            margin: 0 auto;
            background: linear-gradient(145deg, #0f172a 0%, #0a0c14 100%);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1);
        }
        
        /* Header */
        .invoice-header {
            background: linear-gradient(135deg, #0f172a 0%, #1a1f2f 100%);
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
            margin-bottom: 30px;
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
            padding: 8px 16px;
            background: linear-gradient(135deg, #d4af37, #f5d742);
            border-radius: 100px;
            color: #0a0c14;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.5px;
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
        
        /* Bill To Section */
        .bill-to {
            padding: 30px 40px;
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
        
        .bill-to p {
            color: #94a3b8;
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .bill-to .name {
            color: #d4af37;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        /* Items Table */
        .items-section {
            padding: 30px 40px;
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
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table .amount {
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
            color: #d4af37;
            font-weight: 600;
        }
        
        /* Summary Section */
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
            padding-top: 15px;
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
        
        /* Payment Info */
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
            border-radius: 100px;
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
        
        .status-overdue {
            background: rgba(255, 68, 68, 0.1);
            color: #ff4444;
            border: 1px solid #ff4444;
        }
        
        /* Notes */
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
        
        .terms-content {
            color: #94a3b8;
            font-size: 12px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        /* Footer */
        .invoice-footer {
            padding: 20px 40px;
            background: #0a0c14;
            border-top: 1px solid rgba(212, 175, 55, 0.2);
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            
            .invoice-header {
                background: #f8f9fa;
            }
            
            .logo .gold {
                -webkit-text-fill-color: #d4af37;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="header-top">
                <div class="logo">CAR<span class="gold">EASE</span></div>
                <div class="invoice-badge">INVOICE</div>
            </div>
            
            <div class="header-grid">
                <div class="company-info">
                    <h2>${companyInfo.name}</h2>
                    <p>${companyInfo.address || '123 Luxury Lane, Beverly Hills, CA 90210'}</p>
                    <p>${companyInfo.phone || '+1 (800) 555-0123'}</p>
                    <p>${companyInfo.email || 'info@carease.com'}</p>
                </div>
                
                <div class="invoice-info">
                    <div class="info-row">
                        <span class="label">Invoice Number:</span>
                        <span class="value">${invoiceNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Booking ID:</span>
                        <span class="value">${bookingId}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Date Issued:</span>
                        <span class="value">${currentDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Due Date:</span>
                        <span class="value">${formattedDueDate}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Bill To -->
        <div class="bill-to">
            <h3>Bill To:</h3>
            <p class="name">${customerName}</p>
            <p>${customerEmail}</p>
            ${customerPhone ? `<p>${customerPhone}</p>` : ''}
            ${customerAddress ? `<p>${customerAddress}</p>` : ''}
        </div>
        
        <!-- Items -->
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
                    ${items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.unitPrice)}</td>
                            <td class="amount">${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Summary -->
        <div class="summary-section">
            <div class="summary-box">
                <div class="summary-row">
                    <span class="summary-label">Subtotal:</span>
                    <span class="summary-value">${formatCurrency(subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Tax (${TAX_RATE * 100}%):</span>
                    <span class="summary-value">${formatCurrency(tax)}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-row">
                    <span class="summary-label">Discount:</span>
                    <span class="summary-value">-${formatCurrency(discount)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span class="summary-label">Total:</span>
                    <span class="summary-value">${formatCurrency(total)}</span>
                </div>
            </div>
        </div>
        
        <!-- Payment Information -->
        <div class="payment-info">
            <div class="payment-item">
                <div class="label">Payment Method</div>
                <div class="value">${paymentMethod}</div>
            </div>
            <div class="payment-item">
                <div class="label">Payment Status</div>
                <div class="value">
                    <span class="status status-${paymentStatus?.toLowerCase()}">${paymentStatus}</span>
                </div>
            </div>
            ${paymentDate ? `
            <div class="payment-item">
                <div class="label">Payment Date</div>
                <div class="value">${formatDate(paymentDate, { format: 'long' })}</div>
            </div>
            ` : ''}
        </div>
        
        <!-- Notes -->
        ${notes ? `
        <div class="notes-section">
            <div class="notes-title">Notes</div>
            <div class="notes-content">${notes}</div>
        </div>
        ` : ''}
        
        <!-- Terms -->
        ${terms ? `
        <div class="notes-section">
            <div class="notes-title">Terms & Conditions</div>
            <div class="terms-content">${terms}</div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="invoice-footer">
            <p>Thank you for choosing CAR EASE. We appreciate your business!</p>
            <p style="margin-top: 10px;">For questions regarding this invoice, please contact ${companyInfo.supportEmail || companyInfo.email}</p>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Generate plain text invoice
 * @param {Object} data - Invoice data
 * @returns {string} - Plain text
 */
export const generateTextInvoice = (data) => {
  const {
    invoiceNumber,
    bookingId,
    customerName,
    customerEmail,
    items = [],
    subtotal = 0,
    tax = subtotal * TAX_RATE,
    discount = 0,
    total = subtotal + tax - discount,
    paymentStatus
  } = data;

  const lines = [];
  
  // Header
  lines.push('='.repeat(60));
  lines.push('CAR EASE - INVOICE');
  lines.push('='.repeat(60));
  lines.push('');
  
  // Invoice Info
  lines.push(`Invoice Number: ${invoiceNumber}`);
  lines.push(`Booking ID: ${bookingId}`);
  lines.push(`Date: ${formatDate(new Date(), { format: 'long' })}`);
  lines.push('');
  
  // Customer Info
  lines.push('BILL TO:');
  lines.push(`Name: ${customerName}`);
  lines.push(`Email: ${customerEmail}`);
  lines.push('');
  
  // Items
  lines.push('ITEMS:');
  lines.push('-'.repeat(60));
  items.forEach(item => {
    lines.push(`${item.description}`);
    lines.push(`  Quantity: ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`);
  });
  lines.push('-'.repeat(60));
  lines.push('');
  
  // Summary
  lines.push('SUMMARY:');
  lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
  lines.push(`Tax (${TAX_RATE * 100}%): ${formatCurrency(tax)}`);
  if (discount > 0) {
    lines.push(`Discount: -${formatCurrency(discount)}`);
  }
  lines.push(`Total: ${formatCurrency(total)}`);
  lines.push('');
  
  // Payment Status
  lines.push(`Payment Status: ${paymentStatus}`);
  lines.push('');
  
  // Footer
  lines.push('='.repeat(60));
  lines.push('Thank you for choosing CAR EASE!');
  lines.push('='.repeat(60));
  
  return lines.join('\n');
};

/**
 * Generate email invoice content
 * @param {Object} data - Invoice data
 * @returns {Object} - Email subject and HTML
 */
export const generateEmailInvoice = (data) => {
  const {
    invoiceNumber,
    customerName,
    total
  } = data;

  const subject = `Your CAR EASE Invoice #${invoiceNumber}`;
  
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0f172a, #0a0c14); padding: 30px; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Montserrat', sans-serif; color: #ffffff; margin: 0;">
            CAR<span style="color: #d4af37;">EASE</span>
          </h1>
        </div>
        
        <div style="color: #e2e8f0;">
          <p>Dear ${customerName},</p>
          <p>Thank you for choosing CAR EASE. Your invoice is attached to this email.</p>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0; color: #94a3b8;">Invoice Number</p>
            <p style="margin: 5px 0 0; color: #d4af37; font-size: 20px; font-weight: 600;">${invoiceNumber}</p>
            
            <p style="margin: 15px 0 0; color: #94a3b8;">Total Amount</p>
            <p style="margin: 5px 0 0; color: #d4af37; font-size: 24px; font-weight: 700;">${formatCurrency(total)}</p>
          </div>
          
          <p>You can view your full invoice by logging into your account or clicking the button below.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://carease.com/invoices/${invoiceNumber}" 
               style="background: linear-gradient(135deg, #d4af37, #f5d742); color: #0a0c14; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 600; display: inline-block;">
              View Invoice
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px;">
            If you have any questions about this invoice, please contact our support team at support@carease.com
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.2); text-align: center; color: #94a3b8; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CAR EASE. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  return { subject, html };
};

/**
 * Generate invoice PDF (via backend)
 * @param {Object} data - Invoice data
 * @returns {Promise<Blob>} - PDF blob
 */
export const generatePDFInvoice = async (data) => {
  try {
    // This would call your backend API to generate PDF
    const response = await fetch('/api/invoices/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

/**
 * Generate invoice number
 * @param {string} prefix - Invoice prefix
 * @returns {string} - Invoice number
 */
export const generateInvoiceNumber = (prefix = 'INV') => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}${day}-${random}`;
};

/**
 * Download invoice
 * @param {string} content - Invoice content
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadInvoice = (content, filename, type = 'text/html') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Print invoice
 * @param {string} content - Invoice HTML
 */
export const printInvoice = (content) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};

// ===== EXPORT ALL =====
export default {
  generateHTMLInvoice,
  generateTextInvoice,
  generateEmailInvoice,
  generatePDFInvoice,
  generateInvoiceNumber,
  downloadInvoice,
  printInvoice
};