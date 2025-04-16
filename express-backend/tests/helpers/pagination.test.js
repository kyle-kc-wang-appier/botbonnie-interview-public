const pagination = require('../../src/helpers/pagination');

describe('Pagination Helper', () => {
  it('should calculate pagination with default values', () => {
    // Mock request with no query params
    const req = { query: {} };
    
    // Mock count
    const count = 15; // 15 items total
    
    // Execute pagination helper
    const result = pagination(req, count);
    
    // Assertions
    expect(result).toMatchObject({
      count: 15,
      pages: 3, // 15 items / 5 per page = 3 pages
      currentPage: 1, // Default page
      limitPerPage: 5, // Default limit
      prevLink: null, // No prev link on first page
    });
    expect(result.nextLink).toContain('page=2');
  });
  
  it('should calculate pagination with custom page and limit', () => {
    // Mock request with custom query params
    const req = { query: { page: 2, limit: 10 } };
    
    // Mock count
    const count = 25; // 25 items total
    
    // Execute pagination helper
    const result = pagination(req, count);
    
    // Assertions
    expect(result).toMatchObject({
      count: 25,
      pages: 3, // 25 items / 10 per page = 3 pages (ceiling)
      currentPage: 2, // From query
      limitPerPage: 10, // From query
    });
    expect(result.prevLink).toContain('page=1');
    expect(result.nextLink).toContain('page=3');
  });
  
  it('should handle last page with no next link', () => {
    // Mock request on last page
    const req = { query: { page: 3, limit: 10 } };
    
    // Mock count
    const count = 25; // 25 items total
    
    // Execute pagination helper
    const result = pagination(req, count);
    
    // Assertions
    expect(result).toMatchObject({
      count: 25,
      pages: 3, // 25 items / 10 per page = 3 pages
      currentPage: 3, // Last page
      limitPerPage: 10,
      nextLink: null // No next page
    });
    expect(result.prevLink).toContain('page=2');
  });
  
  it('should handle empty result set', () => {
    // Mock request
    const req = { query: { page: 1, limit: 10 } };
    
    // Mock count
    const count = 0; // No items
    
    // Execute pagination helper
    const result = pagination(req, count);
    
    // Assertions
    expect(result).toEqual({
      count: 0,
      pages: 0, // No pages
      currentPage: 1,
      limitPerPage: 10,
      prevLink: null, // No prev link
      nextLink: null // No next link
    });
  });
  
  it('should include route and id for public access', () => {
    // Mock request
    const req = { query: { page: 1, limit: 5 } };
    
    // Mock count, id and route
    const count = 10;
    const id = 123;
    const route = 'categories';
    
    // Execute pagination helper with public access
    const result = pagination(req, count, id, route, 'public');
    
    // Assertions
    expect(result).toMatchObject({
      count: 10,
      pages: 2,
      currentPage: 1,
      limitPerPage: 5,
      prevLink: null
    });
    expect(result.nextLink).toContain(`${route}/${id}`);
    expect(result.nextLink).toContain('page=2');
  });
  
  it('should include route and id for private access', () => {
    // Mock request
    const req = { query: { page: 1, limit: 5 } };
    
    // Mock count, id and route
    const count = 10;
    const id = 123;
    const route = 'categories';
    
    // Execute pagination helper with private access
    const result = pagination(req, count, id, route, 'private');
    
    // Assertions
    expect(result).toMatchObject({
      count: 10,
      pages: 2,
      currentPage: 1,
      limitPerPage: 5,
      prevLink: null
    });
    expect(result.nextLink).toContain(route);
    expect(result.nextLink).toContain('page=2');
  });
});
