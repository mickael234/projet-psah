export default {
    roots: ['<rootDir>'],
    moduleDirectories: ['node_modules', '__mocks__'],
    automock: false,
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.js'],
  };