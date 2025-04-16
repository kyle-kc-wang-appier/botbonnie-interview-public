const jwt = require('jsonwebtoken');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockRequest = (body = {}, params = {}, query = {}, user = null) => {
  return {
    body,
    params,
    query,
    user,
    headers: {}
  };
};

// Generate mock JWT token for testing
const generateMockToken = (userData) => {
  return jwt.sign(userData, 'KODERAHASIA');
};

// Mock DB model function
const mockModel = (returnValue) => {
  return jest.fn().mockResolvedValue(returnValue);
};

module.exports = {
  mockResponse,
  mockRequest,
  generateMockToken,
  mockModel
};
