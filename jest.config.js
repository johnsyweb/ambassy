module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@actions/(.*)$': '<rootDir>/src/actions/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@localtypes/(.*)$': '<rootDir>/src/types/$1',
    '^@parsers/(.*)$': '<rootDir>/src/parsers/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};