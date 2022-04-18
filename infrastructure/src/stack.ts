import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { createBatch } from "./batch";
import { createVPC } from "./vpc";
import { createWebApp } from "./webapp";
import path from "path";

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
        const containerImage = ContainerImage.fromEcrRepository(…);
    */

    const batch = createBatch(this, "batch", {
      vpc,
      image: containerImage,
      imageCommand: ["/app/bin/demoapp-compute", "--name", "Ref::inputdata"],
    });

    const app = createWebApp(this, vpc, containerImage, batch);

    /**
     * Cloudformation Outputs
     */
    new CfnOutput(this, "WebAppUrl", {
      value: `http://${app.loadBalancer.loadBalancerDnsName}/`,
    });
    new CfnOutput(this, "JobDefinitonArn", {
      value: batch.jobDefinition.jobDefinitionArn,
    });
    new CfnOutput(this, "JobQueueArn", {
      value: batch.jobQueue.jobQueueArn,
    });
  }
}
