const cartController = require('../../src/controllers/cartController');
const { mockRequest, mockResponse } = require('../testUtils');
const responseStandard = require('../../src/helpers/response');

// Mock the models
jest.mock('../../src/models/cartModel', () => ({
  getPriceNameItemModel: jest.fn(),
  createCartModel: jest.fn(),
  createCartTotalModel: jest.fn(),
  getDetailIDCartModel: jest.fn(),
  updateQuantityCartModel: jest.fn(),
  updateTotalModel: jest.fn(),
  deleteCartModel: jest.fn(),
  getCartModel: jest.fn(),
  getSummaryCartModel: jest.fn(),
  getCountCartModel: jest.fn()
}));

// Mock the itemsModel for getImagesModel
jest.mock('../../src/models/itemsModel', () => ({
  getImagesModel: jest.fn()
}));

// Import the mocked models
const cartModel = require('../../src/models/cartModel');
const itemsModel = require('../../src/models/itemsModel');

// Mock the response helper
jest.mock('../../src/helpers/response', () => {
  return jest.fn().mockImplementation((res, message, status = 200, success = true, data = {}) => {
    res.status(status).json({
      success,
      message,
      ...data
    });
    return res;
  });
});

describe('Cart Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCart', () => {
    it('should create a cart item successfully', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 2,
          idItem: 1
        },
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getPriceNameItemModel.mockResolvedValue([{ name: 'Test Item', price: 100 }]);
      cartModel.createCartModel.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      cartModel.createCartTotalModel.mockResolvedValue({ affectedRows: 1 });

      // Execute the controller
      await cartController.createCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Item has been added to Cart',
        200,
        true,
        expect.objectContaining({
          data: expect.objectContaining({
            id: 1,
            quantity: 2,
            idItem: 1,
            item: 'Test Item',
            total: 200
          })
        })
      );
      expect(cartModel.createCartModel).toHaveBeenCalledWith([2, 1, 1]);
      expect(cartModel.createCartTotalModel).toHaveBeenCalledWith([200, 1]);
    });

    it('should return error when user is not a customer', async () => {
      // Mock data with non-customer role
      const req = mockRequest(
        {
          quantity: 2,
          idItem: 1
        },
        {},
        {},
        { id: 1, role_id: 2 } // Role 2 is not customer
      );
      const res = mockResponse();

      // Execute the controller
      await cartController.createCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Forbidden Access',
        401,
        false
      );
    });

    it('should return error when required fields are missing', async () => {
      // Mock data with missing fields
      const req = mockRequest(
        {
          // Missing quantity or idItem
        },
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Execute the controller
      await cartController.createCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Cannot get Item',
        400,
        false
      );
    });

    it('should return error when cart creation fails', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 2,
          idItem: 1
        },
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses for failed cart creation
      cartModel.getPriceNameItemModel.mockResolvedValue([{ name: 'Test Item', price: 100 }]);
      cartModel.createCartModel.mockResolvedValue({ affectedRows: 0 });

      // Execute the controller
      await cartController.createCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Cannot add Item to Cart',
        400,
        false
      );
    });

    it('should return error when total creation fails', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 2,
          idItem: 1
        },
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getPriceNameItemModel.mockResolvedValue([{ name: 'Test Item', price: 100 }]);
      cartModel.createCartModel.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      cartModel.createCartTotalModel.mockResolvedValue({ affectedRows: 0 });

      // Execute the controller
      await cartController.createCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Failed to set Total',
        400,
        false
      );
    });
  });

  describe('updateQuantityCart', () => {
    it('should update cart quantity successfully', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 3
        },
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getDetailIDCartModel.mockResolvedValue([{ id: 1, item_id: 2 }]);
      cartModel.getPriceNameItemModel.mockResolvedValue([{ price: 100 }]);
      cartModel.updateQuantityCartModel.mockResolvedValue({ affectedRows: 1 });
      cartModel.updateTotalModel.mockResolvedValue({ affectedRows: 1 });

      // Execute the controller
      await cartController.updateQuantityCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Quantity updated'
      );
      expect(cartModel.updateQuantityCartModel).toHaveBeenCalledWith([1, 3]);
      expect(cartModel.updateTotalModel).toHaveBeenCalledWith([300, 1]);
    });

    it('should return error when user is not a customer', async () => {
      // Mock data with non-customer role
      const req = mockRequest(
        {
          quantity: 3
        },
        { id: 1 },
        {},
        { id: 1, role_id: 2 } // Role 2 is not customer
      );
      const res = mockResponse();

      // Execute the controller
      await cartController.updateQuantityCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Forbidden Access',
        401,
        false
      );
    });

    it('should return error when quantity is invalid', async () => {
      // Mock data with invalid quantity
      const req = mockRequest(
        {
          quantity: 0 // Invalid quantity
        },
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Execute the controller
      await cartController.updateQuantityCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Failed to get quantity, Not Found',
        404,
        false
      );
    });

    it('should return error when quantity update fails', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 3
        },
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses for failed update
      cartModel.getDetailIDCartModel.mockResolvedValue([{ id: 1, item_id: 2 }]);
      cartModel.getPriceNameItemModel.mockResolvedValue([{ price: 100 }]);
      cartModel.updateQuantityCartModel.mockResolvedValue({ affectedRows: 0 });

      // Execute the controller
      await cartController.updateQuantityCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Failed to add',
        400,
        false
      );
    });

    it('should return error when total update fails', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 3
        },
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getDetailIDCartModel.mockResolvedValue([{ id: 1, item_id: 2 }]);
      cartModel.getPriceNameItemModel.mockResolvedValue([{ price: 100 }]);
      cartModel.updateQuantityCartModel.mockResolvedValue({ affectedRows: 1 });
      cartModel.updateTotalModel.mockResolvedValue({ affectedRows: 0 });

      // Execute the controller
      await cartController.updateQuantityCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Failed to update total',
        400,
        false
      );
    });
  });

  describe('deleteCart', () => {
    it('should delete cart item successfully', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getDetailIDCartModel.mockResolvedValue([{ id: 1 }]);
      cartModel.deleteCartModel.mockResolvedValue({ affectedRows: 1 });

      // Execute the controller
      await cartController.deleteCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Cart with id 1 has been deleted'
      );
      expect(cartModel.deleteCartModel).toHaveBeenCalledWith(1);
    });

    it('should return error when user is not a customer', async () => {
      // Mock data with non-customer role
      const req = mockRequest(
        {},
        { id: 1 },
        {},
        { id: 1, role_id: 2 } // Role 2 is not customer
      );
      const res = mockResponse();

      // Execute the controller
      await cartController.deleteCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Forbidden Access',
        401,
        false
      );
    });

    it('should return error when cart item not found', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 999 }, // Non-existent ID
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses for empty result
      cartModel.getDetailIDCartModel.mockResolvedValue([]);

      // Execute the controller
      await cartController.deleteCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Id item in Cart not found',
        404,
        false
      );
    });

    it('should return error when delete operation fails', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses for failed delete
      cartModel.getDetailIDCartModel.mockResolvedValue([{ id: 1 }]);
      cartModel.deleteCartModel.mockResolvedValue({ affectedRows: 0 });

      // Execute the controller
      await cartController.deleteCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Cannot delete',
        400,
        false
      );
    });
  });

  describe('getCart', () => {
    it('should get cart items successfully', async () => {
      // Mock data
      const req = mockRequest(
        {},
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getSummaryCartModel.mockResolvedValue([{ summary: 200 }]);
      cartModel.getCartModel.mockResolvedValue([
        {
          my_cart_id: 1,
          item_id: 1,
          name: 'Test Item',
          price: 100,
          quantity: 2,
          total: 200
        }
      ]);
      itemsModel.getImagesModel.mockResolvedValue([{ url: 'image-url.jpg' }]);
      cartModel.getCountCartModel.mockResolvedValue([{ count: 1 }]);

      // Execute the controller
      await cartController.getCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Summary price of Items',
        200,
        true,
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              item: 'Test Item',
              image: expect.any(String),
              price: 100,
              quantity: 2,
              total: 200
            })
          ]),
          summary: 200,
          count: 1
        })
      );
    });

    it('should handle items without images', async () => {
      // Mock data
      const req = mockRequest(
        {},
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses
      cartModel.getSummaryCartModel.mockResolvedValue([{ summary: 200 }]);
      cartModel.getCartModel.mockResolvedValue([
        {
          my_cart_id: 1,
          item_id: 1,
          name: 'Test Item',
          price: 100,
          quantity: 2,
          total: 200
        }
      ]);
      itemsModel.getImagesModel.mockResolvedValue([]); // No images
      cartModel.getCountCartModel.mockResolvedValue([{ count: 1 }]);

      // Execute the controller
      await cartController.getCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Summary price of Items',
        200,
        true,
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              image: 'There is no image on this item'
            })
          ])
        })
      );
    });

    it('should return error when user is not a customer', async () => {
      // Mock data with non-customer role
      const req = mockRequest(
        {},
        {},
        {},
        { id: 1, role_id: 2 } // Role 2 is not customer
      );
      const res = mockResponse();

      // Execute the controller
      await cartController.getCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Forbidden Access',
        401,
        false
      );
    });

    it('should return error when cart is empty', async () => {
      // Mock data
      const req = mockRequest(
        {},
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Mock model responses for empty cart
      cartModel.getSummaryCartModel.mockResolvedValue([{ summary: null }]);
      cartModel.getCartModel.mockResolvedValue([]);

      // Execute the controller
      await cartController.getCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Failed to set Cart',
        400,
        false
      );
    });
  });

  describe('error handling', () => {
    it('should handle internal server errors in createCart', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 2,
          idItem: 1
        },
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Force an error
      cartModel.getPriceNameItemModel.mockRejectedValue(new Error('Database error'));

      // Execute the controller
      await cartController.createCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Internal server error',
        500,
        false,
        expect.objectContaining({
          error: 'Database error'
        })
      );
    });

    it('should handle internal server errors in updateQuantityCart', async () => {
      // Mock data
      const req = mockRequest(
        {
          quantity: 3
        },
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Force an error
      cartModel.getDetailIDCartModel.mockRejectedValue(new Error('Database error'));

      // Execute the controller
      await cartController.updateQuantityCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Internal server error',
        500,
        false,
        expect.objectContaining({
          error: 'Database error'
        })
      );
    });

    it('should handle internal server errors in deleteCart', async () => {
      // Mock data
      const req = mockRequest(
        {},
        { id: 1 },
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Force an error
      cartModel.getDetailIDCartModel.mockRejectedValue(new Error('Database error'));

      // Execute the controller
      await cartController.deleteCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Internal server error',
        500,
        false,
        expect.objectContaining({
          error: 'Database error'
        })
      );
    });

    it('should handle internal server errors in getCart', async () => {
      // Mock data
      const req = mockRequest(
        {},
        {},
        {},
        { id: 1, role_id: 3 }
      );
      const res = mockResponse();

      // Force an error
      cartModel.getSummaryCartModel.mockRejectedValue(new Error('Database error'));

      // Execute the controller
      await cartController.getCart(req, res);

      // Assertions
      expect(responseStandard).toHaveBeenCalledWith(
        res,
        'Internal server error',
        500,
        false,
        expect.objectContaining({
          error: 'Database error'
        })
      );
    });
  });
});
