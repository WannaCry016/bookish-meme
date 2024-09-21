import morgan from 'morgan';
import rfs from 'rotating-file-stream'; // Using ES module import

// Function to create a rotating file stream
const getRotatingFileStream = () => {
  return rfs.createStream('access.log', {
    interval: '1d', // Rotate daily
    path: 'logs', // Directory where log files will be stored
    size: '10M', // Rotate the log file after 10MB
  });
};

// Function to create and configure Morgan logger
const createMorganLogger = () => {
  const rotatingStream = getRotatingFileStream();

  // Configure Morgan with detailed logging and rotating file stream
  return morgan('combined', {
    stream: rotatingStream,
    skip: (req, res) => res.statusCode < 400, // Log only error responses
    // You can add more morgan format options here
  });
};

export default createMorganLogger;
