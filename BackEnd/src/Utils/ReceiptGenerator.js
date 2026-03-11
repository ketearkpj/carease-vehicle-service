// ===== src/utils/receiptGenerator.js =====
const PDFDocument = require('pdfkit');
const { formatCurrency } = require('./Helpers');

/**
 * Generate a simple PDF receipt buffer for a payment.
 */
exports.generateReceipt = (payment, booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Payment Receipt', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Receipt #: ${payment.paymentNumber || payment._id}`);
      doc.text(`Date: ${new Date(payment.processedAt || payment.createdAt || Date.now()).toLocaleString('en-US')}`);
      doc.text(`Amount: ${formatCurrency(payment.amount || 0, payment.currency || 'USD')}`);
      doc.text(`Method: ${payment.method || payment.gateway || 'N/A'}`);
      doc.moveDown();

      if (booking) {
        doc.text(`Booking #: ${booking.bookingNumber || booking._id}`);
        if (booking.serviceType) {
          doc.text(`Service: ${booking.serviceType}`);
        }
      }

      doc.moveDown();
      doc.text('Thank you for your payment.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
