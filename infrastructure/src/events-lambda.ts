import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as cdk from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";

interface EventsLambdaProps {
  asset: DockerImageAsset;
}

export function createEventsLambda(scope: Construct, name: string, props: EventsLambdaProps) {
  const lambdaFromImage = new lambda.Function(scope, "batch-lambda-image", {
    runtime: lambda.Runtime.FROM_IMAGE,
    handler: lambda.Handler.FROM_IMAGE,
    code: lambda.Code.fromEcrImage(props.asset.repository, {
      entrypoint: ["/usr/local/bin/python", "-m", "awslambdaric"],
      cmd: ["demoapp.lambda.lambda_handler"],
      tagOrDigest: props.asset.assetHash,
    }),

    memorySize: 128,
    architecture: lambda.Architecture.X86_64,
    timeout: cdk.Duration.seconds(10),

    functionName: "batchdemo-lambda-image",
  });

  const rule = new events.Rule(scope, "batchdemo-rule", {
    ruleName: "batchdemo-rule",
    eventPattern: {
      source: ["aws.batch"],
      detail: {
        // status: ["FAILED"],
        status: ["SUCCEEDED"],
      },
      detailType: ["Batch Job State Change"],
    },
  });

  rule.addTarget(
    new targets.LambdaFunction(lambdaFromImage, {
      retryAttempts: 5,
      maxEventAge: cdk.Duration.seconds(300),
    })
  );

  return { lambdaFromImage, rule };
}
