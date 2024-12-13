const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readFileAsync } = require('../utils/fileUtils');

// Route to fetch available tables
router.get('/tables', async (req, res) => {
    const date = req.query.date;
    console.log("In API");
    try {
        const data = await readFileAsync(path.join(__dirname, '../config.json'));
        const config = JSON.parse(data);
        const tables = config[date] || { "A1": 0, "A2": 0, "A3": 0, "A4": 0, "A5": 0, "A6": 0, "A7": 0, "A8": 0 };
        const availableTables = Object.keys(tables).filter(table => tables[table] === 0);
        res.json(availableTables);
    } catch (err) {
        console.error('Error reading config file:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
