const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDF(reservations, reservationDate) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filePath = `./reservations/reservations_${reservationDate}.pdf`; // Path where the PDF will be saved

        // Pipe the PDF to a writable stream
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add content to the PDF
        doc.fontSize(20).text(`Reservations ${reservationDate}`, { align: 'center' }).moveDown();

        reservations.forEach((reservation, index) => {
            doc.fontSize(14).text(`Reservation ${index + 1}:`, { underline: true }).moveDown();
            doc.fontSize(12).text(`Date: ${reservation.date}`);
            doc.text(`Table: ${reservation.table}`);
            doc.text(`Name: ${reservation.firstname} ${reservation.lastname}`);
            doc.text(`Email: ${reservation.email}`);
            doc.text(`Phone: ${reservation.phone}`);
            doc.text(`Number of People: ${reservation.people}`);
            doc.text(`Additional Notes: ${reservation.notes}`);
            doc.moveDown();
        });

        // Finalize the PDF
        doc.end();

        // Handle stream events
        stream.on('finish', () => {
            resolve(filePath);
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
};



module.exports = generatePDF;