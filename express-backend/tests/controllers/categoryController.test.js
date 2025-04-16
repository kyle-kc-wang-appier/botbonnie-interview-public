const categoryController = require('../../src/controllers/categoryController');
const { mockRequest, mockResponse } = require('../testUtils');
const responseStandard = require('../../src/helpers/response');

// Mock the response helper
jest.mock('../../src/helpers/response', () => {
  return jest.fn().mockImplementation((res, message, status, success, data) => {
    res.status(status).json({
      success,
      message,
      ...data
    });
    return res;
  });
});

// Mock the models
jest.mock('../../src/models/categoryModel', () => ({
  createCategoryModel: jest.fn(),
  getAllCategoryModel: jest.fn(),
  updateCategoryModel: jest.fn(),
  deleteCategoryModel: jest.fn(),
  getDetailCategoryModel: jest.fn(),
  getCountCategoryModel: jest.fn(),
  getDetailCategoryIDModel: jest.fn()
}));

// Import the mocked models
const categoryModel = require('../../src/models/categoryModel');

describe('Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      // Mock data
      const req = mockRequest(
        { name: 'Test Category' },
        {},
        {},
        { role_id: 2 } // Seller role
      );
      const res = mockResponse();

      // Mock model responses
      categoryModel.createCategoryModel.mockResolvedValue({ insertId: 1 });

      // Execute the controller
      await categoryController.createCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Category has been created',
        expect.any(Number),
        true,
        expect.any(Object)
      );
    });

    it('should return error when user is not a seller', async () => {
      // Mock data with non-seller role
      const req = mockRequest(
        { name: 'Test Category' },
        {},
        {},
        { role_id: 3 } // Customer role
      );
      const res = mockResponse();

      // Execute the controller
      await categoryController.createCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        expect.stringContaining('Access denied'),
        expect.any(Number),
        false
      );
    });
  });

  describe('getAllCategory', () => {
    it('should get all categories successfully', async () => {
      // Mock data
      const req = mockRequest();
      const res = mockResponse();

      // Mock model responses
      categoryModel.getAllCategoryModel.mockResolvedValue([
        { id: 1, category_name: 'Category 1' },
        { id: 2, category_name: 'Category 2' }
      ]);

      // Execute the controller
      await categoryController.getAllCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'List of Category',
        expect.any(Number),
        true,
        expect.any(Object)
      );
    });

    it('should return error when no categories found', async () => {
      // Mock data
      const req = mockRequest();
      const res = mockResponse();

      // Mock model responses for empty result
      categoryModel.getAllCategoryModel.mockResolvedValue([]);

      // Execute the controller
      await categoryController.getAllCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Data not found',
        expect.any(Number),
        false
      );
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      // Mock data
      const req = mockRequest(
        { name: 'Updated Category' },
        { id: 1 },
        {},
        { role_id: 2 } // Seller role
      );
      const res = mockResponse();

      // Mock model responses
      categoryModel.updateCategoryModel.mockResolvedValue({ affectedRows: 1 });

      // Execute the controller
      await categoryController.updateCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Category updated'
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 1 },
        {},
        { role_id: 2 } // Seller role
      );
      const res = mockResponse();

      // Mock model responses
      categoryModel.getDetailCategoryIDModel.mockResolvedValue([{ id: 1, category_name: 'Test Category' }]);
      categoryModel.deleteCategoryModel.mockResolvedValue({ affectedRows: 1 });

      // Execute the controller
      await categoryController.deleteCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Category has been deleted'
      );
    });

    it('should return error when category not found', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 999 }, // Non-existent ID
        {},
        { role_id: 2 }
      );
      const res = mockResponse();

      // Mock model responses for empty result
      categoryModel.getDetailCategoryIDModel.mockResolvedValue([]);

      // Execute the controller
      await categoryController.deleteCategory(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Category not found',
        expect.any(Number),
        false
      );
    });
  });
});
