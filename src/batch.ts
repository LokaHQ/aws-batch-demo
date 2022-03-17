import * as batch from 'aws-cdk-lib/aws-batch';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import { posix } from 'path';


interface BatchProps {
  image: DockerImageAsset;
  imageCommand: string[];
}
export function createBatch(scope: Construct, name: string, props: BatchProps) {


  const computeEnvironment = new batch.CfnComputeEnvironment(scope, "computeEnvironment", {
    type: "type"
  });

  const jobQueue = new batch.CfnJobQueue(scope, 'jobQueue', {
    computeEnvironmentOrder: [{
      computeEnvironment: 'computeEnvironment',
      order: 123,
    }],
    priority: 123,

    jobQueueName: 'jobQueueName',
    state: 'state',
  });

  const jobDefinition = new batch.CfnJobDefinition(scope, 'jobDefinition', {
    type: 'type',
    jobDefinitionName: 'jobDefinitionName',

    containerProperties: {
      image: props.image.imageUri,
      command: props.imageCommand,
    },
  });

  return {computeEnvironment, jobDefinition, jobQueue};
}
