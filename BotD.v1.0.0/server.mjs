import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { Parser } from 'json2csv';
import { determineBotKind } from './check_user_agent.js';  // Import the new function
//import { updateCrawlerUserAgents, updateBotUserAgents } from './generate.js';  // Function to import latest data
//import morganLogger from './middleware/morganLogger.mjs';
//import rateLimiter from './middleware/rateLimiter.mjs';
import { logRequest } from './middleware/winstonLogger.js';  // Import the logger

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies for all routes
app.use(express.json());

// Middleware for logging requests
app.use(logRequest);  // Apply the logging middleware

// Serve static files from the current directory
app.use(express.static('.'));

// Helper function to flatten and normalize the rules structure
function normalizeRules(rules) {
  const normalized = [];

  Object.entries(rules).forEach(([detectorName, detectorRules]) => {
    if (Array.isArray(detectorRules)) {
      detectorRules.forEach(rule => {
        normalized.push({
          detector: detectorName,
          ...rule
        });
      });
    } else if (typeof detectorRules === 'object') {
      if (detectorRules.parameters || detectorRules.conditions) {
        normalized.push({
          detector: detectorName,
          ...detectorRules
        });
      } else {
        Object.entries(detectorRules).forEach(([key, value]) => {
          normalized.push({
            detector: detectorName,
            name: key,
            ...value
          });
        });
      }
    }
  });

  return normalized;
}

// Endpoint to get all rules
app.get('/api/rules', async (req, res) => {
  try {
    console.log('Received request to /api/rules');
    const filePath = path.join(__dirname, 'json files', 'combined_rules.json');
    console.log(`Reading file from path: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf8');
    console.log('File read successfully');
    const combinedRules = JSON.parse(content).botDetection;

    const normalizedRules = normalizeRules(combinedRules);

    res.json(normalizedRules);
  } catch (error) {
    console.error('Error reading rules:', error);
    res.status(500).json({ error: 'Failed to load rules' });
  }
});


function flattenObject(obj, parent, res = {}) {
  for (let key in obj) {
    let propName = parent ? parent + '.' + key : key;
    if (typeof obj[key] == 'object' && !Array.isArray(obj[key])) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}

app.post('/botdetected/json', async (req, res) => {
  try {
    const botInfo = req.body;

    // Check if user-agent is a bot and determine botKind
    const userAgent = botInfo.browserDetails?.userAgent || "";
    const botDetection = await determineBotKind(userAgent);
    botInfo.isBot = botDetection.isBot;
    botInfo.botKind = botDetection.botKind;

    const csvFilePath = path.join(__dirname, 'bot_detections.csv');
    console.log(`CSV file path: ${csvFilePath}`);

    const flattenedBotInfo = flattenObject(botInfo);

    // Define the fields to include in the CSV
    const fieldsToInclude = [
      "isBot",
      "botKind",
      "detectedRules",
      "browserDetails.userAgent",
      "browserDetails.platform",
      "browserDetails.language",
      "browserDetails.cookiesEnabled",
      "browserDetails.doNotTrack",
      "browserDetails.screenResolution",
      "browserDetails.colorDepth",
      "browserDetails.plugins",
      "browserDetails.timezone",
      "browserDetails.webdriver",
      "browserDetails.languages",
      "browserDetails.productSub",
      "browserDetails.maxTouchPoints",
      "browserDetails.process",
      "browserDetails.android",
      "browserDetails.browserKind",
      "browserDetails.browserEngineKind",
      "browserDetails.mimeTypesConsistent",
      "browserDetails.evalLength",
      "browserDetails.inconsistentEval",
      "browserDetails.webGL.vendor",
      "browserDetails.webGL.renderer",
      "browserDetails.windowExternal.present",
      "browserDetails.windowExternal.properties",
      "detectionTime",
      "detectorsResults.appVersion.bot",
      "detectorsResults.name.bot",
      "detectorsResults.rules.bot",
      "detectorsResults.distinctiveProperties.bot",
      "detectorsResults.documentElementKeys.bot",
      "detectorsResults.errorTrace.bot",
      "detectorsResults.evalLength.bot",
      "detectorsResults.functionBind.bot",
      "detectorsResults.languageInconsistency.bot",
      "detectorsResults.mimeTypesConsistence.bot",
      "detectorsResults.notificationPermission.bot",
      "detectorsResults.pluginsArray.bot",
      "detectorsResults.pluginsInconsistency.bot",
      "detectorsResults.process.bot",
      "detectorsResults.productSub.bot",
      "detectorsResults.rtt.bot",
      "detectorsResults.userAgent.bot",
      "detectorsResults.webDriver.bot",
      "detectorsResults.webGL.bot",
      "detectorsResults.windowExternal.bot",
      "detectorsResults.windowSize.bot",
      "appVersion.value",
      "appVersion.state",
      "userAgent.value",
      "userAgent.state",
      "webDriver.value",
      "webDriver.state",
      "languages.value",
      "languages.state",
      "productSub.value",
      "productSub.state",
      "pluginsArray.value",
      "pluginsArray.state",
      "pluginsLength.value",
      "pluginsLength.state",
      "windowSize.value.outerWidth",
      "windowSize.value.outerHeight",
      "windowSize.value.innerWidth",
      "windowSize.value.innerHeight",
      "windowSize.state",
      "documentFocus.value",
      "documentFocus.state",
      "rtt.value",
      "rtt.state",
      "errorTrace.value",
      "errorTrace.state",
      "documentElementKeys.value",
      "documentElementKeys.state",
      "functionBind.value",
      "functionBind.state",
      "distinctiveProps.value.awesomium",
      "distinctiveProps.value.cef",
      "distinctiveProps.value.phantom",
      "distinctiveProps.value.selenium",
      "distinctiveProps.value.webdriver",
      "distinctiveProps.value.domAutomation",
      "distinctiveProps.state",
      "notificationPermissions.value",
      "notificationPermissions.state"
    ];

    const filteredBotInfo = {};
    fieldsToInclude.forEach(field => {
      if (flattenedBotInfo.hasOwnProperty(field)) {
        filteredBotInfo[field] = flattenedBotInfo[field];
      }
    });

    console.log('Filtered Bot Info:', filteredBotInfo);

    // Create CSV data from filteredBotInfo
    let csvData = fieldsToInclude.map(field => {
      let value = filteredBotInfo[field];

      if (value === null || value === undefined) {
        return ''; // Leave empty for null or undefined values
      } else if (typeof value === 'object') {
        let stringValue = stringifyNestedObject(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      } else if (typeof value === 'string') {
        value = value.replace(/\n/g, ' ').replace(/"/g, '""');
        return `"${value}"`;
      } else {
        return value;
      }
    }).join(',');

    function stringifyNestedObject(obj) {
      return JSON.stringify(obj);
    }

    const fields = Object.keys(filteredBotInfo);
    const parser = new Parser({ fields });

    let fileExists;
    try {
      await fs.access(csvFilePath);
      fileExists = true;
    } catch {
      fileExists = false;
    }

    console.log(`CSV file exists: ${fileExists}`);

    if (fileExists) {
      await fs.appendFile(csvFilePath, '\n' + csvData);
      console.log('Appended to CSV file');
    } else {
      csvData = fieldsToInclude.join(',') + '\n' + csvData;
      await fs.writeFile(csvFilePath, csvData);
      console.log('Created new CSV file and wrote data');
    }

    res.json({ success: true, message: 'Bot detection data received and saved.' });
  } catch (error) {
    console.error('Error processing bot detection data:', error);
    res.status(500).json({ error: 'Failed to process bot detection data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
