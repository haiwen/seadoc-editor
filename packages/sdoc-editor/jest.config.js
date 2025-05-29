const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, './'),
  roots: ['<rootDir>/tests/'],
  testMatch: ['<rootDir>/tests/**/(*.)+(spec|test).[jt]s?(x)'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(js|jsx|mjs)$': ['babel-jest', { configFile: path.resolve(__dirname, '.babelrc') }],
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!unified)/',
  ],
};
