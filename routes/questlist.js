const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const generateListPDF = require('../tools/pdfToolsList');
const { readFileAsync, writeFileAsync } = require('../utils/fileUtils');

// Path to the quest list file
const questListFilePath = path.join(__dirname, '../list.json');

// Route to submit a quest list item
router.post('/questlist', async (req, res) => {
    
    const formData = req.body;
    const { questListDate, firstname, lastname, people, notes } = formData;

    try {
        
        
        // Read the existing data from the file
        const data = await readFileAsync(questListFilePath);
        const questList = data ? JSON.parse(data) : []; // Initialize as an empty array if file is empty

        console.log(formData);

        // Push the new item into the array
        questList.push({ questListDate, firstname, lastname, people, notes});
        console.log(notes)

        // Write the updated array back to the file
        await writeFileAsync(questListFilePath, JSON.stringify(questList, null, 2));
        console.log('Quest list item saved.');

        // Send a success response
        res.json({ success: true });

    } catch (err) {
        console.error('Error handling quest list item:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Route to fetch quest list items
router.get('/questlist', async (req, res) => {
    const date = req.query.date;
    try {
        const data = await readFileAsync(questListFilePath);
        const questList = JSON.parse(data);
        
        // Filter by date if a date is provided
        const filteredQuestList = questList.filter(item => item.questListDate === date);
        res.json(filteredQuestList);

    } catch (err) {
        console.error('Error reading quest list file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to download quest list as PDF
router.get('/download-questlist', async (req, res) => {
    console.log("Made the API call");
    const date = req.query.date;
    console.log(date);
    try {
        const data = await readFileAsync(questListFilePath);
        const questList = JSON.parse(data);
        
        // Filter by date for the PDF generation
        const filteredQuestList = questList.filter(item => item.questListDate === date);
        if (filteredQuestList.length > 0) {
            console.log("Calling Generate PDF");
            const filePath = await generateListPDF(filteredQuestList, date);
            const fileName = `questlist_${date}.pdf`;
            res.download(filePath, fileName);
        } else {
            res.status(404).send('No quest list items for chosen date.');
        }
    } catch (err) {
        console.error('Error handling download:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a reservation
router.delete('/questlist', async (req, res) => {
    const { date, firstname, lastname } = req.body; // Identify reservation by date and lastname and firstname
    console.log("In API to delete", date, firstname, lastname);
    try {
        const data = await readFileAsync(questListFilePath);
        let reservations = JSON.parse(data);
        console.log(reservations);
        const reservationToDelete = reservations.find(reservation => reservation.questListDate === date && reservation.lastname === lastname && reservation.firstname === firstname);
        console.log("To delete is ", reservationToDelete);

        if (!reservationToDelete) {
            res.status(404).send('Reservation not found.');
            return;
        }

        reservations = reservations.filter(reservation => !(reservation.questListDate === date && reservation.lastname === lastname && reservation.firstname === firstname));
        await writeFileAsync(questListFilePath, JSON.stringify(reservations, null, 2));
        console.log('Quest deleted successfully.');
        res.status(200).send('Quest deleted successfully.');

    } catch (err) {
        console.error('Error deleting Quest:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
