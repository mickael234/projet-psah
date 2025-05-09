// Silence console logs during tests
global.console = {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
  
  // Set up environment variables for testing
  process.env.NODE_ENV = "test"
  process.env.JWT_SECRET = "test-jwt-secret"
  