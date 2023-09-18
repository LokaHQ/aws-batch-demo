import path from "path";
import { Construct } from "constructs";
import { CfnOutput, Size, Stack, StackProps } from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import {
  Action,
  FargateComputeEnvironment,
  JobQueue,
  EcsJobDefinition,
  EcsFargateContainerDefinition,
  RetryStrategy,
  Reason,
} from "aws-cdk-lib/aws-batch";

import { createVPC } from "./vpc";
import { createWebApp } from "./webapp";

export class AwsBatchDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = createVPC(this);

    // Build and upload a Docker image to ECR
    const asset = new DockerImageAsset(this, "image", {
      directory: path.join(__dirname, "..", "..", "python-demoapp"),
    });
    const containerImage = ContainerImage.fromDockerImageAsset(asset);
    /**
     *  Alternatively, we can use an image already in ECR
     *  const containerImage = ContainerImage.fromEcrRepository(…);
     */

    /**
     * Batch on Fargate
     */
    const batchComputeEnv = new FargateComputeEnvironment(this, "myFargateComputeEnv", {
      vpc,
      computeEnvironmentName: "batch-demo",
    });

    const batchQueue = new JobQueue(this, "JobQueue", { jobQueueName: "batch-demo" });
    batchQueue.addComputeEnvironment(batchComputeEnv, 100);

    const batchDefn = new EcsJobDefinition(this, "JobDefn", {
      jobDefinitionName: "batch-demo",
      container: new EcsFargateContainerDefinition(this, "containerDefn", {
        image: containerImage,
        command: ["/app/bin/demoapp-compute", "--name", "Ref::inputdata"],
        memory: Size.mebibytes(512),
        cpu: 256,
      }),
      retryAttempts: 5,
      retryStrategies: [RetryStrategy.of(Action.EXIT, Reason.CANNOT_PULL_CONTAINER)],
    });

    /**
     * Create the Webapp on Fargate
     */
    const app = createWebApp(this, vpc, containerImage, { jobQueue: batchQueue, jobDefinition: batchDefn });

    batchDefn.grantSubmitJob(app.taskDefinition.taskRole, batchQueue);

    /**
     * Cloudformation Outputs
     */
    new CfnOutput(this, "WebAppUrl", {
      value: `http://${app.loadBalancer.loadBalancerDnsName}/`,
    });
    new CfnOutput(this, "JobDefinitonArn", {
      value: batchDefn.jobDefinitionArn,
    });
    new CfnOutput(this, "JobQueueArn", {
      value: batchQueue.jobQueueArn,
    });
  }
}
