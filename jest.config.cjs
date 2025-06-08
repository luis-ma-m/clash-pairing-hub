// jest.config.js
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  // Most tests (components) run in a jsdom environment; server tests can override as needed
  testEnvironment: 'jsdom',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  setupFiles: ['<rootDir>/jest.polyfill.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/server/__tests__/', '/src/components/__tests__/'],

  transformIgnorePatterns: [
    '/node_modules/(?!(?:@supabase)/)'
  ],

  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
      useESM: true
    }
  }
};
