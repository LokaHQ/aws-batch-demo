import { JobQueue, JobDefinitionBase } from "aws-cdk-lib/aws-batch";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export function createWebApp(
  scope: Construct,
  vpc: IVpc,
  containerImage: ContainerImage,
  batch: { jobQueue: JobQueue; jobDefinition: JobDefinitionBase },
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
    /* A real production deployment would have https,
     * and a DNS Zone and Certificates and all,
     * but this is a demo.
     */
    redirectHTTP: false,
    domainName: undefined,
    domainZone: undefined,
    protocol: ApplicationProtocol.HTTP,
  });

  loadBalancedFargate.targetGroup.configureHealthCheck({
    path: "/healthcheck",
  });

  loadBalancedFargate.taskDefinition.addToTaskRolePolicy(
    new PolicyStatement({
      actions: ["batch:ListJobs"],
      resources: ["*"],
    }),
  );

  return loadBalancedFargate;
}
