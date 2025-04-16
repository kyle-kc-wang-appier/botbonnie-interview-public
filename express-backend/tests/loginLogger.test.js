const fs = require('fs');
const path = require('path');
const { logSuccessfulLogin, logFailedLogin } = require('../src/helpers/loginLogger');

// Mock fs module
jest.mock('fs');
jest.mock('path');

describe('Login Logger', () => {
  const mockLogDir = '/mock/path/logs';
  const mockLogFile = '/mock/path/logs/auth_logins_2025-04-15.log';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock path.join to return predictable paths
    path.join.mockImplementation((...args) => {
      if (args.includes('../../logs')) {
        return mockLogDir;
      }
      return mockLogFile;
    });

    // Mock Date to return a fixed date
    const mockDate = new Date('2025-04-15T10:00:00Z');
    global.Date = jest.fn(() => mockDate);
    global.Date.toISOString = jest.fn(() => mockDate.toISOString());
    global.Date.prototype.toISOString = jest.fn(() => '2025-04-15T10:00:00.000Z');

    // Mock fs.existsSync to return false first time (directory doesn't exist)
    fs.existsSync.mockReturnValue(true);

    // Mock console.error and console.log to avoid cluttering test output
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original Date
    global.Date = Date;
  });

  describe('logSuccessfulLogin', () => {
    test('should log successful login attempt', async () => {
      // Arrange
      const userData = { email: mockEmail };

      // Act
      await logSuccessfulLogin(userData);

      // Assert
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining(`SUCCESS - Login for email: ${mockEmail}`)
      );
    });

    test('should create logs directory if it does not exist', async () => {
      // Arrange
      fs.existsSync.mockReturnValueOnce(false);
      const userData = { email: mockEmail };

      // Act
      await logSuccessfulLogin(userData);

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockLogDir, { recursive: true });
    });

    test('should handle missing email in userData', async () => {
      // Arrange
      const userData = {};

      // Act
      await logSuccessfulLogin(userData);

      // Assert
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('Login for email: unknown')
      );
    });

    test('should handle errors when logging', async () => {
      // Arrange
      fs.appendFileSync.mockImplementationOnce(() => {
        throw new Error('Mock file system error');
      });
      const userData = { email: mockEmail };

      // Act
      await logSuccessfulLogin(userData);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Error logging successful login:',
        expect.any(Error)
      );
    });
  });

  describe('logFailedLogin', () => {
    test('should return false if user has only 4 failed attempts today', async () => {
      const mockLogContent = [
        '2025-04-15T09:00:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T09:05:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T09:10:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T09:15:00.000Z - FAILED - Login attempt for email: test@example.com'
      ].join('\n');
      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'test@example.com' });
      expect(result).toBe(false);
    });

    test('should return true after 5 consecutive failed attempts today', async () => {
      const mockLogContent = Array(5).fill(
        '2025-04-15T09:00:00.000Z - FAILED - Login attempt for email: test@example.com'
      ).join('\n');
      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'test@example.com' });
      expect(result).toBe(true);
    });

    test('should return false if user has 4 failed attempts after a success login', async () => {
      const mockLogContent = [
        '2025-04-15T08:00:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T08:05:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T08:10:00.000Z - SUCCESS - Login for email: test@example.com',
        '2025-04-15T08:15:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T08:20:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T08:25:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T08:30:00.000Z - FAILED - Login attempt for email: test@example.com'
      ].join('\n');
      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'test@example.com' });
      expect(result).toBe(false);
    });

    test('should return true if user failed 5 times after a successful login', async () => {
      const mockLogContent = [
        '2025-04-15T07:00:00.000Z - SUCCESS - Login for email: test@example.com',
        '2025-04-15T07:10:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T07:15:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T07:20:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T07:25:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T07:30:00.000Z - FAILED - Login attempt for email: test@example.com'
      ].join('\n');
      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'test@example.com' });
      expect(result).toBe(true);
    });

    test('should not count failed attempts from previous day', async () => {
      const mockLogContent = [
        '2025-04-14T23:55:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-14T23:56:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-14T23:57:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-14T23:58:00.000Z - FAILED - Login attempt for email: test@example.com',
        '2025-04-15T00:00:00.000Z - FAILED - Login attempt for email: test@example.com'
      ].join('\n');
      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'test@example.com' });
      expect(result).toBe(false);
    });

    test('should not block user if only other users failed login', async () => {
      const mockLogContent = [
        '2025-04-15T09:00:00.000Z - FAILED - Login attempt for email: other1@example.com',
        '2025-04-15T09:01:00.000Z - FAILED - Login attempt for email: other2@example.com',
        '2025-04-15T09:02:00.000Z - FAILED - Login attempt for email: other3@example.com',
        '2025-04-15T09:03:00.000Z - FAILED - Login attempt for email: other4@example.com',
        '2025-04-15T09:04:00.000Z - FAILED - Login attempt for email: other5@example.com'
      ].join('\n');
      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'target@example.com' });
      expect(result).toBe(false);
    });

    test('should block only user with 5 failed attempts, not others', async () => {
      const mockLogContent = [
        '2025-04-15T08:00:00.000Z - FAILED - Login attempt for email: u1@example.com',
        '2025-04-15T08:05:00.000Z - FAILED - Login attempt for email: u1@example.com',
        '2025-04-15T08:10:00.000Z - FAILED - Login attempt for email: u1@example.com',
        '2025-04-15T08:15:00.000Z - FAILED - Login attempt for email: u1@example.com',
        '2025-04-15T08:20:00.000Z - FAILED - Login attempt for email: u1@example.com',
        '2025-04-15T09:00:00.000Z - FAILED - Login attempt for email: u2@example.com',
        '2025-04-15T09:05:00.000Z - FAILED - Login attempt for email: u2@example.com'
      ].join('\n');

      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const r1 = await logFailedLogin({ email: 'u1@example.com' });
      const r2 = await logFailedLogin({ email: 'u2@example.com' });
      expect(r1).toBe(true); 
      expect(r2).toBe(false);
    });

    test('should not reset failed counter for user B when user A logs in successfully', async () => {
      const mockLogContent = [
        '2025-04-15T09:00:00.000Z - SUCCESS - Login for email: a@example.com',
        '2025-04-15T09:10:00.000Z - FAILED - Login attempt for email: b@example.com',
        '2025-04-15T09:11:00.000Z - FAILED - Login attempt for email: b@example.com',
        '2025-04-15T09:12:00.000Z - FAILED - Login attempt for email: b@example.com',
        '2025-04-15T09:13:00.000Z - FAILED - Login attempt for email: b@example.com',
        '2025-04-15T09:14:00.000Z - FAILED - Login attempt for email: b@example.com'
      ].join('\n');

      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'b@example.com' });
      expect(result).toBe(true);
    });

    test('should block a@example.com after 5 failed attempts, even if b@example.com logged in successfully in between', async () => {
      const mockLogContent = [
        '2025-04-15T08:00:00.000Z - FAILED - Login attempt for email: a@example.com',
        '2025-04-15T08:05:00.000Z - FAILED - Login attempt for email: a@example.com',
        '2025-04-15T08:10:00.000Z - FAILED - Login attempt for email: a@example.com',
        '2025-04-15T08:15:00.000Z - FAILED - Login attempt for email: a@example.com',

        '2025-04-15T08:20:00.000Z - SUCCESS - Login for email: b@example.com',

        '2025-04-15T08:25:00.000Z - FAILED - Login attempt for email: a@example.com'
      ].join('\n');

      fs.readFileSync.mockReturnValueOnce(mockLogContent);
      const result = await logFailedLogin({ email: 'a@example.com' });
      expect(result).toBe(true); // ✅ 應該被 block，b 的成功不會影響 a
    });

    test('should handle missing email in userData', async () => {
      // Arrange
      const userData = {};
      fs.readFileSync.mockReturnValueOnce('');

      // Act
      await logFailedLogin(userData);

      // Assert
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('Login attempt for email: unknown')
      );
    });

    test('should handle errors when logging', async () => {
      // Arrange
      fs.appendFileSync.mockImplementationOnce(() => {
        throw new Error('Mock file system error');
      });
      const userData = { email: mockEmail };

      // Act
      const result = await logFailedLogin(userData);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Error logging failed login:',
        expect.any(Error)
      );
      expect(result).toBe(false); // Should not block user if logging fails
    });
  });
});
