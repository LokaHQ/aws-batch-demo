import * as batch from "@aws-cdk/aws-batch-alpha";
import { IVpc, SubnetType } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

interface BatchProps {
  vpc: IVpc;
  image: ContainerImage;
  imageCommand: string[];
}
export function createBatch(scope: Construct, name: string, props: BatchProps) {
  const computeEnvironment = new batch.ComputeEnvironment(scope, "computeEnvironment", {
    computeResources: {
      vpc: props.vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      type: batch.ComputeResourceType.ON_DEMAND,
    },
  });

  const jobQueue = new batch.JobQueue(scope, "jobQueue", {
    jobQueueName: "jobQueueName",
    computeEnvironments: [{ computeEnvironment, order: 100 }],
  });

  const jobDefinition = new batch.JobDefinition(scope, "jobDefinition", {
    jobDefinitionName: "jobDefinitionName",
    container: { image: props.image, command: props.imageCommand, assignPublicIp: true },
  });

  return { computeEnvironment, jobDefinition, jobQueue };
}
