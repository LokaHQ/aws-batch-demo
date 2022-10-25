module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  "moduleNameMapper": { "^aws-cdk-lib/.warnings.jsii.js$": "<rootDir>/node_modules/aws-cdk-lib/.warnings.jsii.js" },
};
