module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['lcov', 'text'],
  coverageThreshold: {
    global: {
      // TODO: Increase Coverage Requirement
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  }
}
