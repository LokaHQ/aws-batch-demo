import { Stack, StackProps } from "aws-cdk-lib";
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
    const vpc = new Vpc(this, "vpc",{});

    const asset = new DockerImageAsset(this, 'image', {
      directory: path.join(__dirname, '..'),
    });

    const batch = createBatch(this, "batch", {
      image: asset,
      imageCommand: ["/app/bin/demoapp-compute"]
    });

    const loadBalancedEcsService = new ApplicationLoadBalancedFargateService(this, 'Service', {
      vpc,
      memoryLimitMiB: 512,
      taskImageOptions: {
        image: ContainerImage.fromDockerImageAsset(asset),
        environment: {
          JOB_DEFINITION: batch.jobDefinition.getAtt("Arn").toString(),
          JOB_QUEUE: batch.jobQueue.getAtt("Arn").toString(),
        },
      },
      desiredCount: 2,
    });
  }
}
