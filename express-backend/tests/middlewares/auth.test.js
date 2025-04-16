const authMiddleware = require('../../src/middlewares/auth');
const jwt = require('jsonwebtoken');
const responseStandard = require('../../src/helpers/response');

// Mock the response helper
jest.mock('../../src/helpers/response', () => {
  return jest.fn().mockImplementation((res, message, status, success) => {
    res.status(status).json({
      success,
      message
    });
    return res;
  });
});

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    responseStandard.mockClear();
  });

  it('should call next() when token is valid', () => {
    // Mock valid token
    const token = 'valid-token';
    const decodedToken = { id: 1, role_id: 3 };
    req.headers.authorization = `Bearer ${token}`;

    // Mock jwt.verify to return decoded token
    jwt.verify = jest.fn().mockReturnValue(decodedToken);

    // Execute middleware
    authMiddleware(req, res, next);

    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith(token, 'KODERAHASIA');
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 when no authorization header', () => {
    // Execute middleware without authorization header
    authMiddleware(req, res, next);

    // Assertions
    expect(responseStandard).toHaveBeenCalledWith(
      res,
      'Authorization needed',
      401,
      false
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token format is invalid', () => {
    // Set invalid token format
    req.headers.authorization = 'InvalidToken';

    // Execute middleware
    authMiddleware(req, res, next);

    // Assertions
    expect(responseStandard).toHaveBeenCalledWith(
      res,
      'Authorization needed',
      401,
      false
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', () => {
    // Mock invalid token
    const token = 'invalid-token';
    req.headers.authorization = `Bearer ${token}`;

    // Mock jwt.verify to throw error
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Token error');
    });

    // Execute middleware
    authMiddleware(req, res, next);

    // Assertions
    expect(responseStandard).toHaveBeenCalledWith(
      res,
      'Token error',
      401,
      false,
      {error: "Token error"}
    );
    expect(next).not.toHaveBeenCalled();
  });
});
