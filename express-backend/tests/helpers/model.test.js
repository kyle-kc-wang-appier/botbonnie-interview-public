const model = require('../../src/helpers/model');

// Mock the database
jest.mock('../../src/helpers/db', () => ({
  query: jest.fn()
}));

const db = require('../../src/helpers/db');

describe('Model Helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with results when query is successful', async () => {
    // Mock data
    const query = 'SELECT * FROM users';
    const mockResults = [{ id: 1, name: 'Test User' }];

    // Mock db.query to call callback with results
    db.query.mockImplementation((q, data, callback) => {
      callback(null, mockResults, null);
    });

    // Execute model function
    const results = await model(query);

    // Assertions
    expect(db.query).toHaveBeenCalledWith(query, '', expect.any(Function));
    expect(results).toEqual(mockResults);
  });

  it('should reject with error when query fails', async () => {
    // Mock data
    const query = 'SELECT * FROM users';
    const mockError = new Error('Database error');

    // Mock db.query to call callback with error
    db.query.mockImplementation((q, data, callback) => {
      callback(mockError, null, null);
    });

    // Execute model function and expect it to reject
    await expect(model(query)).rejects.toEqual(mockError);
    expect(db.query).toHaveBeenCalledWith(query, '', expect.any(Function));
  });

  it('should pass data parameter to query when provided', async () => {
    // Mock data
    const query = 'INSERT INTO users SET ?';
    const data = { name: 'Test User', email: 'test@example.com' };
    const mockResults = { insertId: 1, affectedRows: 1 };

    // Mock db.query to call callback with results
    db.query.mockImplementation((q, d, callback) => {
      callback(null, mockResults, null);
    });

    // Execute model function
    const results = await model(query, data);

    // Assertions
    expect(db.query).toHaveBeenCalledWith(query, data, expect.any(Function));
    expect(results).toEqual(mockResults);
  });
});
