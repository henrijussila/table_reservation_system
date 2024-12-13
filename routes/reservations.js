const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const generatePDF = require('../tools/pdfTools');
const { readFileAsync, writeFileAsync } = require('../utils/fileUtils');

const reservationsFilePath = path.join(__dirname, '../reservations.json');
const configFilePath = path.join(__dirname, '../config.json');

// Route to submit a reservation
router.post('/submit', async (req, res) => {
    const formData = req.body;
    const { date, table, firstname, lastname, email, phone, people, notes } = formData;

    try {
        console.log(formData);
        const data = await readFileAsync(reservationsFilePath);
        const reservations = JSON.parse(data);
        reservations.push({ date, table, firstname, lastname, email, phone, people, notes });

        await writeFileAsync(reservationsFilePath, JSON.stringify(reservations, null, 2));
        console.log('Reservation details saved.');

        const configFilePath = path.join(__dirname, '../config.json');
        const configData = await readFileAsync(configFilePath);
        const config = JSON.parse(configData);

        if (!config[date]) {
            config[date] = { "A1": 0, "A2": 0, "A3": 0, "A4": 0, "A5": 0, "A6": 0, "A7": 0, "A8": 0 };
        }
        config[date][table] = 1;

        await writeFileAsync(configFilePath, JSON.stringify(config, null, 2));
        console.log('Config updated.');

        res.redirect('/main');

    } catch (err) {
        console.error('Error handling reservation:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to fetch reservations
router.get('/reservations', async (req, res) => {
    const date = req.query.date;
    try {
        const data = await readFileAsync(reservationsFilePath);
        const reservations = JSON.parse(data);
        const filteredReservations = reservations.filter(reservation => reservation.date === date);
        res.json(filteredReservations);
    } catch (err) {
        console.error('Error reading reservations file:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a reservation
router.delete('/reservations', async (req, res) => {
    const { date, email } = req.body; // Identify reservation by date and email (or any unique identifier)
    try {
        const data = await readFileAsync(reservationsFilePath);
        let reservations = JSON.parse(data);
        const reservationToDelete = reservations.find(reservation => reservation.date === date && reservation.email === email);

        if (!reservationToDelete) {
            res.status(404).send('Reservation not found.');
            return;
        }

        reservations = reservations.filter(reservation => !(reservation.date === date && reservation.email === email));
        await writeFileAsync(reservationsFilePath, JSON.stringify(reservations, null, 2));
        console.log('Reservation deleted successfully.');

        // Update the config.json file to make the table available
        const configData = await readFileAsync(configFilePath);
        const config = JSON.parse(configData);

        if (config[date] && config[date][reservationToDelete.table] === 1) {
            config[date][reservationToDelete.table] = 0; // Make the table available
            await writeFileAsync(configFilePath, JSON.stringify(config, null, 2));
            console.log('Table availability updated in config.');
        }

        res.status(200).send('Reservation deleted successfully.');
    } catch (err) {
        console.error('Error deleting reservation:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to download reservations as PDF
router.get('/download', async (req, res) => {
    const date = req.query.date;
    try {
        const data = await readFileAsync(reservationsFilePath);
        const reservations = JSON.parse(data);
        const filteredReservations = reservations.filter(reservation => reservation.date === date);
        if (filteredReservations.length > 0) {
            const filePath = await generatePDF(filteredReservations, date);
            const fileName = `reservations_${date}.pdf`;
            res.download(filePath, fileName);
        } else {
            res.status(404).send('No reservations for chosen date.');
        }
    } catch (err) {
        console.error('Error handling download:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
