/// <reference types="jest" />
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { AwsBatchDemoStack } from "../src/stack";

test("snapshot matches previous state", () => {
  const app = new cdk.App();
  const stack = new AwsBatchDemoStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  const templateJson = template.toJSON();

  expect(templateJson).toMatchSnapshot();
});
