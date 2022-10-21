#!/usr/bin/env ts-node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import { Vpc } from "aws-cdk-lib/aws-ec2";

export class TestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, "vpc");

    // Note - The username must match the existing master username of the snapshot.
    const credentials = rds.SnapshotCredentials.fromGeneratedSecret("username", {
      excludeCharacters: "!&*^#@()",
    });

    const engine = rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_12_3 });
    new rds.DatabaseInstanceFromSnapshot(this, "InstanceFromSnapshotWithCustomizedSecret", {
      engine,
      vpc,
      snapshotIdentifier: "mySnapshot",
      credentials,
    });
  }
}

const app = new cdk.App();
new TestStack(app, "TestStack");
