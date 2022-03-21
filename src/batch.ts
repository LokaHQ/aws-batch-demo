import * as batch from "@aws-cdk/aws-batch-alpha";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

interface BatchProps {
  image: ContainerImage;
  imageCommand: string[];
}
export function createBatch(scope: Construct, name: string, props: BatchProps) {
  const computeEnvironment = new batch.ComputeEnvironment(scope, "computeEnvironment", {});

  const jobQueue = new batch.JobQueue(scope, "jobQueue", {
    jobQueueName: "jobQueueName",
    computeEnvironments: [{ computeEnvironment, order: 100 }],
  });

  const jobDefinition = new batch.JobDefinition(scope, "jobDefinition", {
    jobDefinitionName: "jobDefinitionName",
    container: { image: props.image, command: props.imageCommand },
  });

  return { computeEnvironment, jobDefinition, jobQueue };
}
