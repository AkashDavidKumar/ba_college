/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  // Map path aliases so Jest resolves them the same way TypeScript does
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types-local/(.*)$': '<rootDir>/src/types/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        // Relax unused-variable errors in test files for DX
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
    }],
  },
  // setupFiles run in EACH test worker process before module loading.
  // This ensures process.env is set before any test module is required.
  // (globalSetup runs in a separate process and does NOT propagate env vars to workers)
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  // Timeout per test — 10 s is generous for unit/integration tests
  testTimeout: 10000,
  // Produce coverage when run with --coverage flag
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/tests/**',
    '!src/server.ts',  // process lifecycle — not unit-testable
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
