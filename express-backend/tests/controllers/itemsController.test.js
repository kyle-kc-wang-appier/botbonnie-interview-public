const itemsController = require('../../src/controllers/itemsController');
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
jest.mock('../../src/models/itemsModel', () => ({
  createItemModel: jest.fn(),
  createImageModel: jest.fn(),
  getDetailItemModel: jest.fn(),
  getDetailItemModelBySeller: jest.fn(),
  getImagesModel: jest.fn(),
  updatePartialItemModel: jest.fn(),
  updateImagesItemModel: jest.fn(),
  deleteItemModel: jest.fn(),
  getItemModel: jest.fn(),
  getItemCountModel: jest.fn()
}));

// Import the mocked models
const itemsModel = require('../../src/models/itemsModel');

describe('Items Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDetailItem', () => {
    it('should get item details successfully', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 1 }
      );
      const res = mockResponse();

      // Mock model responses
      itemsModel.getDetailItemModel.mockResolvedValue([
        {
          id: 1,
          name: 'Test Item',
          description: 'Test Description',
          category: 'Test Category',
          price: 100
        }
      ]);
      itemsModel.getImagesModel.mockResolvedValue([
        { id: 1, url: 'image1.jpg' },
        { id: 2, url: 'image2.jpg' }
      ]);

      // Execute the controller
      await itemsController.getDetailItem(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Detail item Test Item',
        expect.any(Number),
        true,
        expect.any(Object)
      );
    });

    it('should return error when item not found', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 999 } // Non-existent ID
      );
      const res = mockResponse();

      // Mock model responses for empty result
      itemsModel.getDetailItemModel.mockResolvedValue([]);

      // Execute the controller
      await itemsController.getDetailItem(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Data not found',
        expect.any(Number),
        false
      );
    });
  });

  describe('getItems', () => {
    it('should get items with pagination successfully', async () => {
      // Mock data
      const req = mockRequest(
        {},
        {},
        { page: 1, limit: 10 }
      );
      const res = mockResponse();

      // Mock model responses
      itemsModel.getItemModel.mockResolvedValue([
        {
          id: 1,
          name: 'Test Item 1',
          price: 100,
          category: 'Test Category'
        },
        {
          id: 2,
          name: 'Test Item 2',
          price: 200,
          category: 'Test Category'
        }
      ]);
      itemsModel.getItemCountModel.mockResolvedValue([{ count: 2 }]);

      // Execute the controller
      await itemsController.getItems(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'List of Items',
        expect.any(Number),
        true,
        expect.any(Object)
      );
    });

    it('should return error when no items found', async () => {
      // Mock data
      const req = mockRequest(
        {},
        {},
        { page: 1, limit: 10 }
      );
      const res = mockResponse();

      // Mock model responses for empty result
      itemsModel.getItemModel.mockResolvedValue([]);
      itemsModel.getItemCountModel.mockResolvedValue([{ count: 0 }]);

      // Execute the controller
      await itemsController.getItems(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Items not found',
        expect.any(Number),
        false
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete an item successfully', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { idItem: 1 },
        {},
        { id: 1, role_id: 2 } // Seller role
      );
      const res = mockResponse();

      // Mock model responses
      itemsModel.getDetailItemModelBySeller.mockResolvedValue([
        { id: 1, name: 'Test Item' }
      ]);
      itemsModel.deleteItemModel.mockResolvedValue({ affectedRows: 1 });

      // Execute the controller
      await itemsController.deleteItem(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Item has been deleted',
      );
    });

    it('should return error when item not found', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { idItem: 999 }, // Non-existent ID
        {},
        { id: 1, role_id: 2 }
      );
      const res = mockResponse();

      // Mock model responses for empty result
      itemsModel.getDetailItemModelBySeller.mockResolvedValue([]);

      // Execute the controller
      await itemsController.deleteItem(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Data not found',
        expect.any(Number),
        false
      );
    });
  });
});
