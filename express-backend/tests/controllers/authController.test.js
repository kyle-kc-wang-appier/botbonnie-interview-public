const authController = require('../../src/controllers/authController');
const { mockRequest, mockResponse } = require('../testUtils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logFailedLogin } = require('../../src/helpers/loginLogger');

// Mock the required models
jest.mock('../../src/models/userModel', () => ({
  getUserByConditionModel: jest.fn(),
  getUserRoleByConditionModel: jest.fn(),
  createUserDetailModel: jest.fn(),
  createUserModel: jest.fn()
}));

// Mock the loginLogger
jest.mock('../../src/helpers/loginLogger', () => ({
  logFailedLogin: jest.fn()
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compareSync: jest.fn()
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

const userModel = require('../../src/models/userModel');

describe('Auth Controller Tests', () => {
  let req;
  let res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('createUserCustomer', () => {
    it('should create a customer user successfully', async () => {
      // Setup
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      userModel.getUserByConditionModel.mockResolvedValue([]);
      userModel.createUserDetailModel.mockResolvedValue({ affectedRows: 1, insertId: 1 });
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      userModel.createUserModel.mockResolvedValue({ affectedRows: 1 });

      // Execute
      await authController.createUserCustomer(req, res);

      // Assert
      expect(userModel.getUserByConditionModel).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(userModel.createUserDetailModel).toHaveBeenCalledWith({
        name: 'Test User',
        role_id: 3
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(userModel.createUserModel).toHaveBeenCalledWith([1, 'test@example.com', 'hashedPassword']);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Congratulation! Now you have an account!'
        })
      );
    });

    it('should return error if email already exists', async () => {
      // Setup
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      userModel.getUserByConditionModel.mockResolvedValue([{ id: 1, email: 'existing@example.com' }]);

      // Execute
      await authController.createUserCustomer(req, res);

      // Assert
      expect(userModel.getUserByConditionModel).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email already used'
        })
      );
    });

    it('should return error if validation fails', async () => {
      // Setup
      req.body = {
        name: 'Test User',
        // Missing email and password
      };

      // Execute
      await authController.createUserCustomer(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Oops! You have to fill all form for register!'
        })
      );
    });
  });

  describe('createUserSeller', () => {
    it('should create a seller user successfully', async () => {
      // Setup
      req.body = {
        name: 'Seller Name',
        store_name: 'Test Store',
        email: 'seller@example.com',
        phone_number: '1234567890',
        password: 'password123'
      };

      userModel.getUserByConditionModel.mockResolvedValue([]);
      userModel.createUserDetailModel.mockResolvedValue({ affectedRows: 1, insertId: 2 });
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      userModel.createUserModel.mockResolvedValue({ affectedRows: 1 });

      // Execute
      await authController.createUserSeller(req, res);

      // Assert
      expect(userModel.getUserByConditionModel).toHaveBeenCalledWith({ email: 'seller@example.com' });
      expect(userModel.createUserDetailModel).toHaveBeenCalledWith({
        name: 'Seller Name',
        store_name: 'Test Store',
        phone_number: '1234567890',
        role_id: 2
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(userModel.createUserModel).toHaveBeenCalledWith([2, 'seller@example.com', 'hashedPassword']);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Register as a Seller successfully'
        })
      );
    });

    it('should return error if validation fails for seller', async () => {
      // Setup
      req.body = {
        name: 'Seller Name',
        // Missing required fields
      };

      // Execute
      await authController.createUserSeller(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error'
        })
      );
    });
  });

  describe('loginController', () => {
    it('should login successfully with correct credentials', async () => {
      // Setup
      req.body = {
        email: 'user@example.com',
        password: 'correctPassword'
      };

      userModel.getUserByConditionModel.mockResolvedValue([{
        user_id: 1,
        email: 'user@example.com',
        password: 'hashedPassword'
      }]);
      bcrypt.compareSync.mockReturnValue(true);
      userModel.getUserRoleByConditionModel.mockResolvedValue([{ role_id: 3 }]);
      jwt.sign.mockReturnValue('generated-token');

      // Execute
      await authController.loginController(req, res);

      // Assert
      expect(userModel.getUserByConditionModel).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
      expect(userModel.getUserRoleByConditionModel).toHaveBeenCalledWith({ id: 1 });
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1, role_id: 3 }, 'KODERAHASIA');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login Successfully',
          token: 'generated-token'
        })
      );
    });

    it('should return error with wrong password', async () => {
      // Setup
      req.body = {
        email: 'user@example.com',
        password: 'wrongPassword'
      };

      userModel.getUserByConditionModel.mockResolvedValue([{
        user_id: 1,
        email: 'user@example.com',
        password: 'hashedPassword'
      }]);
      bcrypt.compareSync.mockReturnValue(false);
      logFailedLogin.mockResolvedValue(false); // Not blocked

      // Execute
      await authController.loginController(req, res);

      // Assert
      expect(userModel.getUserByConditionModel).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(logFailedLogin).toHaveBeenCalledWith(expect.objectContaining({
        email: 'user@example.com',
        timestamp: expect.any(Date)
      }));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Wrong password'
        })
      );
    });

    it('should return error with wrong email', async () => {
      // Setup
      req.body = {
        email: 'nonexistent@example.com',
        password: 'anyPassword'
      };

      userModel.getUserByConditionModel.mockResolvedValue([]);
      logFailedLogin.mockResolvedValue(false); // Not blocked

      // Execute
      await authController.loginController(req, res);

      // Assert
      expect(userModel.getUserByConditionModel).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(logFailedLogin).toHaveBeenCalledWith(expect.objectContaining({
        email: 'nonexistent@example.com',
        timestamp: expect.any(Date)
      }));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Wrong email'
        })
      );
    });

    it('should block user after too many failed attempts', async () => {
      // Setup
      req.body = {
        email: 'user@example.com',
        password: 'wrongPassword'
      };

      userModel.getUserByConditionModel.mockResolvedValue([{
        user_id: 1,
        email: 'user@example.com',
        password: 'hashedPassword'
      }]);
      bcrypt.compareSync.mockReturnValue(false);
      logFailedLogin.mockResolvedValue(true); // User should be blocked

      // Execute
      await authController.loginController(req, res);

      // Assert
      expect(logFailedLogin).toHaveBeenCalledWith(expect.objectContaining({
        email: 'user@example.com',
        timestamp: expect.any(Date)
      }));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Too many failed login attempts. Please try again tomorrow.'
        })
      );
    });

    it('should return error if validation fails for login', async () => {
      // Setup
      req.body = {
        // Missing email and password
      };

      // Execute
      await authController.loginController(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Login Failed'
        })
      );
    });
  });
});
