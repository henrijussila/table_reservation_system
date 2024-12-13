const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateListPDF(reservations, reservationDate) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filePath = `./reservations/list_${reservationDate}.pdf`; // Path where the PDF will be saved

        // Pipe the PDF to a writable stream
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add title to the PDF
        doc.fontSize(20).text(`Questlist for ${reservationDate}`, { align: 'center' }).moveDown();

        // Sort the reservations by last name in alphabetical order
        reservations.sort((a, b) => a.lastname.localeCompare(b.lastname));

        // Add each reservation to the PDF with a smaller font size
        reservations.forEach((reservation, index) => {
            doc.fontSize(12).text(`${reservation.lastname} ${reservation.firstname} + ${reservation.people} (${reservation.notes})`);
            doc.moveDown(0.1); // Optional: Add some space between each entry
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

module.exports = generateListPDF;
