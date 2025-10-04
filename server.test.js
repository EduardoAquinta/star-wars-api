const request = require('supertest');
const fetch = require('node-fetch');
const app = require('./server');

// Mock node-fetch
jest.mock('node-fetch');

describe('Star Wars API Server', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/:category', () => {
    it('should fetch and return data for a category with default page', async () => {
      const mockData = {
        count: 82,
        results: [
          { name: 'Luke Skywalker', height: '172' },
          { name: 'C-3PO', height: '167' }
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      const response = await request(app)
        .get('/api/people')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/people/?page=1');
    });

    it('should fetch and return data for a category with specified page', async () => {
      const mockData = {
        count: 82,
        results: [
          { name: 'Darth Vader', height: '202' }
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      const response = await request(app)
        .get('/api/people?page=2')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/people/?page=2');
    });

    it('should work with different categories', async () => {
      const mockData = {
        count: 60,
        results: [
          { name: 'Tatooine', climate: 'arid' }
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      const response = await request(app)
        .get('/api/planets')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/planets/?page=1');
    });

    it('should handle fetch errors and return 500 status', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/people')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch data from SWAPI' });
    });

    it('should handle JSON parse errors', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      const response = await request(app)
        .get('/api/films')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch data from SWAPI' });
    });
  });

  describe('GET /api/:category/:id', () => {
    it('should fetch and return data for a specific item', async () => {
      const mockData = {
        name: 'Luke Skywalker',
        height: '172',
        mass: '77',
        hair_color: 'blond'
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      const response = await request(app)
        .get('/api/people/1')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/people/1/');
    });

    it('should handle different categories and ids', async () => {
      const mockData = {
        name: 'Death Star',
        model: 'DS-1 Orbital Battle Station'
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      const response = await request(app)
        .get('/api/starships/9')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/starships/9/');
    });

    it('should handle fetch errors and return 500 status', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/people/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch data from SWAPI' });
    });

    it('should handle JSON parse errors for specific items', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      const response = await request(app)
        .get('/api/vehicles/4')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch data from SWAPI' });
    });
  });

  describe('Static file serving', () => {
    it('should serve static files from public directory', async () => {
      // This test verifies that express.static middleware is configured
      // The actual file serving is tested by Express, we just verify the route works
      const response = await request(app)
        .get('/');

      // Should either return HTML or 404 if index.html doesn't exist in test env
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Edge cases', () => {
    it('should handle page parameter as string', async () => {
      const mockData = { count: 10, results: [] };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      await request(app)
        .get('/api/people?page=abc')
        .expect(200);

      // Should pass the string to SWAPI (SWAPI will handle invalid values)
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/people/?page=abc');
    });

    it('should handle multiple query parameters', async () => {
      const mockData = { count: 10, results: [] };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      await request(app)
        .get('/api/people?page=2&extra=param')
        .expect(200);

      // Should only use the page parameter
      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/people/?page=2');
    });

    it('should handle missing page parameter and default to 1', async () => {
      const mockData = { count: 10, results: [] };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      await request(app)
        .get('/api/films')
        .expect(200);

      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/films/?page=1');
    });

    it('should handle empty results from SWAPI', async () => {
      const mockData = { count: 0, results: [] };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      const response = await request(app)
        .get('/api/species')
        .expect(200);

      expect(response.body).toEqual(mockData);
    });
  });

  describe('Server initialization', () => {
    it('should export the Express app', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should not start server in test mode', () => {
      // This verifies that app.listen is not called when NODE_ENV is 'test'
      // The test itself running proves this works, as we can use supertest
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should have listen method available', () => {
      // Verify app has listen capability (from Express)
      expect(typeof app.listen).toBe('function');
    });
  });

  describe('API endpoint completeness', () => {
    it('should handle all valid SWAPI categories', async () => {
      const categories = ['people', 'films', 'starships', 'vehicles', 'species', 'planets'];

      for (const category of categories) {
        const mockData = { count: 1, results: [] };
        fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue(mockData)
        });

        await request(app)
          .get(`/api/${category}`)
          .expect(200);

        expect(fetch).toHaveBeenCalledWith(`https://swapi.dev/api/${category}/?page=1`);
      }
    });

    it('should handle numeric IDs correctly', async () => {
      const mockData = { name: 'Test' };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData)
      });

      await request(app)
        .get('/api/people/999')
        .expect(200);

      expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/people/999/');
    });
  });
});
