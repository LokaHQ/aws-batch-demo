/// <reference types="jest" />
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { AwsBatchDemoStack } from "../src/stack";

test("snapshot matches previous state", () => {
  const app = new cdk.App();
  const stack = new AwsBatchDemoStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  const jobDefinitions = template.findResources("AWS::Batch::JobDefinition");
  cleanUpAssetsJobDefinitions(jobDefinitions);
  const taskDefinitions = template.findResources("AWS::ECS::TaskDefinition");
  cleanUpAssetsTaskDefinitions(taskDefinitions);

  const templateJson = template.toJSON();
  expect(templateJson).toMatchSnapshot();
});


/*** in-place mutate to replace the Image asset */
function cleanUpAssetsJobDefinitions(resources: any) {
  for (const key of Object.keys(resources)) {
    const resource = resources[key];
    resource["Properties"]["ContainerProperties"]["Image"] = "dummy";
  }
}

/*** in-place mutate to replace the Image asset */
function cleanUpAssetsTaskDefinitions(resources: any) {
  for (const key of Object.keys(resources)) {
    const resource = resources[key];
    const containerDefitions = resource["Properties"]["ContainerDefinitions"];
    for (const container of containerDefitions) {
      container["Image"] = "dummy";
    }
  }
}
