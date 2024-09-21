import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { createLogger, transports, format } from 'winston';
import csvWriter from 'csv-writer';
import axios from 'axios';

// Re-create __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CSV Writing Function
const filePath = `${__dirname}/../logs/access_logs.csv`;
const csvHeaderWritten = fs.existsSync(filePath);

const writer = csvWriter.createObjectCsvWriter({
  path: filePath,
  header: [
    { id: 'timestamp', title: 'Timestamp' },
    { id: 'ipAddress', title: 'IP Address' },
    { id: 'referer', title: 'Referer' },
    { id: 'userAgent', title: 'User-Agent' },
    { id: 'geolocation', title: 'Geolocation' },  // Added column for geolocation
  ],
  append: true,
});

// Maintain a set of unique visit identifiers
const uniqueVisits = new Set();

async function getGeolocation(ipAddress) {
  if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
    return 'Local Machine';  // Return a default message for local IPs
  }

  try {
    const response = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
    const { city, region, country } = response.data;
    console.log('Geolocation response:', response.data); // Debug log
    return `${city || 'Unknown'}, ${region || 'Unknown'}, ${country || 'Unknown'}`;
  } catch (error) {
    console.error('Error fetching geolocation:', error); // Error log
    return 'Unknown';  // Default value in case of error
  }
}

async function writeToCSV(logEntry) {
  const uniqueKey = `${logEntry.ipAddress}-${logEntry.timestamp}`;

  if (!uniqueVisits.has(uniqueKey)) {
    uniqueVisits.add(uniqueKey);

    // Add geolocation details
    const geolocation = await getGeolocation(logEntry.ipAddress);

    const csvData = {
      timestamp: logEntry.timestamp,
      ipAddress: logEntry.ipAddress,
      referer: logEntry.referer,
      userAgent: logEntry.userAgent,
      geolocation: geolocation,
    };

    writer.writeRecords([csvData])
      .then(() => console.log('Log entry written to CSV'))
      .catch(err => console.error('Error writing log entry to CSV', err));
  }
}

// Winston Logger Configuration
const logger = createLogger({
  level: 'verbose',  // Set the log level to verbose
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Human-readable timestamp
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;  // Line format
    })
  ),
  transports: [
    new transports.File({
      filename: `${__dirname}/../logs/combined.log`,
      level: 'verbose',  // Log verbose level details
    }),
    new transports.Console({
      format: format.simple(),
    }),
  ],
});

// Log request details, including IP retrieval
async function logRequest(req, res, next) {
  let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Handling multiple IPs in x-forwarded-for (client IP might be first in a comma-separated list)
  if (ipAddress.includes(',')) {
    ipAddress = ipAddress.split(',')[0].trim();
  }

  // Convert IPv6 localhost to IPv4
  if (ipAddress === '::1') {
    ipAddress = '127.0.0.1';
  }

  const geolocation = await getGeolocation(ipAddress);  // Fetch geolocation info

  const logEntry = {
    timestamp: new Date().toISOString(),
    ipAddress: ipAddress,
    request: req.method + ' ' + req.url,  // Log request details
    status: res.statusCode,              // Log response status
    referer: req.headers.referer || 'N/A',
    userAgent: req.headers['user-agent'],
    geolocation: geolocation,  // Add geolocation info to log entry
  };

  // Log to file and console
  const logMessage = `IP: ${logEntry.ipAddress}, Geolocation: ${logEntry.geolocation}, Request: ${logEntry.request}, Status: ${logEntry.status}, Referer: ${logEntry.referer}, User-Agent: ${logEntry.userAgent}`;
  logger.verbose(logMessage);  // Use verbose level

  // Write to CSV
  await writeToCSV(logEntry);

  next();
}

export { logRequest };
