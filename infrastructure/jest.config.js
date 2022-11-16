module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // see https://github.com/aws/aws-cdk/issues/20622
  moduleNameMapper: {
    "^aws-cdk-lib/.warnings.jsii.js$": "<rootDir>/node_modules/aws-cdk-lib/.warnings.jsii.js",
  },
};
