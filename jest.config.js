export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  globals: {
    'jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    
  }
};
