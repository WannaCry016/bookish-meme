const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON
app.use(bodyParser.json());

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Utility function to sanitize string values
const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        // Replace newlines and carriage returns with a space
        return value.replace(/\n/g, ' ').replace(/\r/g, ' ');
    }
    return value; // Return the value as is if it's not a string
};

// Function to flatten the JSON object without prefixes
const flattenObject = (obj, parent = '', result = {}) => {
    for (let key in obj) {
        const propName = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively flatten the object
            flattenObject(obj[key], propName, result);
        } else {
            // Remove the prefixes from keys
            const cleanedKey = propName.replace(/^(parameters|finalResult)\./, '');
            // Sanitize the value to prevent distortion
            result[cleanedKey] = sanitizeValue(obj[key]);
        }
    }
    return result;
};

// API endpoint to save JSON data as CSV
app.post('/api/saveData', async (req, res) => {
    const jsonData = req.body; // Get JSON data from the request body

    try {
        console.log('Received JSON Data:', jsonData);

        // Flatten the JSON data
        const flattenedData = flattenObject(jsonData);

        // Check if the CSV file already exists
        const filePath = path.join(__dirname,'Training data' ,'training_data.csv');

        // Prepare CSV writer with append option
        const csvWriter = createObjectCsvWriter({
            path: filePath, // Path where the CSV will be saved
            header: Object.keys(flattenedData).map(key => ({
                id: key,
                title: key.replace(/\./g, '_') // Replace dots with underscores for valid CSV headers
            })),
            append: fs.existsSync(filePath), // Check if the file exists to determine if we should append
            fieldDelimiter: ',', // Specify delimiter if needed
            alwaysQuote: true, // Ensure all fields are quoted
        });

        // Convert the flattened data to an array of objects
        const records = [flattenedData]; // Wrap in an array to match csv-writer's expected format

        // Write records to CSV
        await csvWriter.writeRecords(records);
        
        res.status(200).send('CSV file has been updated successfully!');
    } catch (error) {
        console.error('Error converting JSON to CSV:', error);
        res.status(500).send('Error converting JSON to CSV');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
