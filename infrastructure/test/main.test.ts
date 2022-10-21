/// <reference types="jest" />
import * as cdk from "aws-cdk-lib";
import "jest-cdk-snapshot";

import { AwsBatchDemoStack} from "../src/stack";

test("snapshot matches previous state", () => {
  const app = new cdk.App();
  const stack = new AwsBatchDemoStack(app, "MyTestStack");

  expect(stack).toMatchCdkSnapshot({
    ignoreAssets: true,
  });
})
