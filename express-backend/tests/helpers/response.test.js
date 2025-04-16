const responseStandard = require('../../src/helpers/response');

describe('Response Helper', () => {
  it('should return standard response format with default values', () => {
    // Mock response object
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Execute response helper
    responseStandard(res, 'Success message');

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success message'
    });
  });

  it('should return response with custom status and success flag', () => {
    // Mock response object
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Execute response helper with custom values
    responseStandard(res, 'Error message', 400, false);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error message'
    });
  });

  it('should include additional data in response', () => {
    // Mock response object
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Additional data
    const additionalData = {
      data: [{ id: 1, name: 'Test' }],
      count: 1
    };

    // Execute response helper with additional data
    responseStandard(res, 'Success with data', 200, true, additionalData);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success with data',
      data: [{ id: 1, name: 'Test' }],
      count: 1
    });
  });
});
