import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";
import path from "path";
import { createBatch } from "./batch";
import { createVPC } from "./vpc";

export class AwsBatchDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = createVPC(this);

    // Build and upload a Docker image to ECR (can we have custom repository?)
    const asset = new DockerImageAsset(this, "image", {
      directory: path.join(__dirname, "..", "python-demoapp"),
    });
    const containerImage = ContainerImage.fromDockerImageAsset(asset);
    // Alternatively, we can use an image already in ECR
    // const containerImage = ContainerImage.fromEcrRepository(…);

    const batch = createBatch(this, "batch", {
      vpc,
      image: containerImage,
      imageCommand: ["/app/bin/demoapp-compute"],
    });

    const loadBalancedEcsService = new ApplicationLoadBalancedFargateService(this, "Service", {
      vpc,
      memoryLimitMiB: 512,
      assignPublicIp: true,
      taskImageOptions: {
        image: containerImage,
        containerPort: 7070,
        environment: {
          HTTP_PORT: "7070",
          JOB_DEFINITION: batch.jobDefinition.jobDefinitionArn,
          JOB_QUEUE: batch.jobQueue.jobQueueArn,
        },
      },
      desiredCount: 2,
      // redirectHTTP: true,
    });

    loadBalancedEcsService.targetGroup.configureHealthCheck({
      path: "/healthcheck",
    });

    new CfnOutput(this, "alb-url", {
      value: `http://${loadBalancedEcsService.loadBalancer.loadBalancerDnsName}/`,
    });
  }
}
