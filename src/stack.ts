import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";
import path from "path";
import { createBatch } from "./batch";

export class AwsBatchDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, "vpc", {});

    const asset = new DockerImageAsset(this, "image", {
      directory: path.join(__dirname, ".."),
    });
    const containerImage = ContainerImage.fromDockerImageAsset(asset);

    const batch = createBatch(this, "batch", {
      vpc,
      image: containerImage,
      imageCommand: ["/app/bin/demoapp-compute"],
    });

    const loadBalancedEcsService = new ApplicationLoadBalancedFargateService(this, "Service", {
      vpc,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: containerImage,
        environment: {
          JOB_DEFINITION: batch.jobDefinition.jobDefinitionArn,
          JOB_QUEUE: batch.jobQueue.jobQueueArn,
        },
      },
      desiredCount: 2,
    });

    new CfnOutput(this, "alb-url", {
      value: `http://${loadBalancedEcsService.loadBalancer.loadBalancerDnsName}/`,
    });
  }
}
