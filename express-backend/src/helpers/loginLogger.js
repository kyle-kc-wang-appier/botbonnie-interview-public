const fs = require('fs');
const path = require('path');

/**
 * Gets the log file path for the current day
 * Format of log files: auth_logins_YYYY-MM-DD.log
 * Example entry: 2023-04-15T10:23:45.678Z - SUCCESS - Login for email: admin@example.com
 * @returns {string} Path to the log file
 */
const getLogFilePath = () => {
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, `auth_logins.log`);

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Created logs directory at: ${logDir}`);
  }

  return logFile;
};

/**
 * Logs successful login attempts to the auth log file
 * @param {Object} userData - User data including email and timestamp
 * @returns {Promise<void>}
 */
const logSuccessfulLogin = async (userData) => {
  try {
    const logFile = getLogFilePath();

    // Append to log file
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - SUCCESS - Login for email: ${userData.email || 'unknown'}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('Error logging successful login:', err);
  }
};

/**
 * Logs failed login attempts to the auth log file
 * @param {Object} userData - User data including email and timestamp
 * @returns {Promise<boolean>} - Whether the user should be blocked based on failed attempts
 */
const logFailedLogin = async (userData) => {
  try {
    const logFile = getLogFilePath();

    // Append to log file
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - FAILED - Login attempt for email: ${userData.email || 'unknown'}\n`;
    fs.appendFileSync(logFile, logEntry);

    // Check if user has too many failed attempts today
    const logs = fs.readFileSync(logFile, 'utf8');
    const userFailedAttempts = logs.split('\n')
      .filter(line => line.includes(`email: ${userData.email}`) && line.includes('FAILED'))
      .length;

    // Block user after 5 failed attempts in a day
    return userFailedAttempts >= 5;
  } catch (err) {
    console.error('Error logging failed login:', err);
    return false; // Don't block user if logging fails
  }
};

module.exports = {
  logFailedLogin,
  logSuccessfulLogin
};
