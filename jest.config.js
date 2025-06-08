export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', useESM: true }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};
