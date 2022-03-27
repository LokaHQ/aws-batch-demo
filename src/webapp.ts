import { JobDefinition, JobQueue } from "@aws-cdk/aws-batch-alpha";
import { CfnOutput } from "aws-cdk-lib";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export function createWebApp(
  scope: Construct,
  vpc: IVpc,
  containerImage: ContainerImage,
  batch: { jobQueue: JobQueue; jobDefinition: JobDefinition }
) {
  const loadBalancedFargate = new ApplicationLoadBalancedFargateService(scope, "Service", {
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
        SECRET_KEY: "0736e5b9-a884-4252-911c-6f9d73513a21",
      },
    },
    desiredCount: 2,
    // redirectHTTP: true,
  });

  loadBalancedFargate.targetGroup.configureHealthCheck({
    path: "/healthcheck",
  });

  loadBalancedFargate.taskDefinition.addToTaskRolePolicy(
    new PolicyStatement({
      actions: ["batch:ListJobs"],
      resources: ["*"],
    })
  );
  loadBalancedFargate.taskDefinition.addToTaskRolePolicy(
    new PolicyStatement({
      actions: ["batch:SubmitJob"],
      resources: [batch.jobQueue.jobQueueArn, batch.jobDefinition.jobDefinitionArn],
    })
  );

  new CfnOutput(scope, "WebAppUrl", {
    description: "URL to access the deployed Web App",
    value: `http://${loadBalancedFargate.loadBalancer.loadBalancerDnsName}/`,
  });

  return loadBalancedFargate;
}
