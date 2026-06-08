module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(test|spec).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  testTimeout: 15000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
