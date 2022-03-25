import { IVpc, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

/**
 * Opinionated VPC with disabled SubnetType.PRIVATE_WITH_NAT
 * Private subnets would also create NAT gateways, and EIPs
 * which incur a heafty price, but are often not needed.
 *
 * The VPC will only have Public and Isolated subnets.
 *
 * @param scope the parent CDK scope (typically the stack)
 * @returns an interface to the created VPC
 */
export function createVPC(scope: Construct): IVpc {
  return new Vpc(scope, "vpc", {
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: "ingress",
        subnetType: SubnetType.PUBLIC,
      },
      {
        cidrMask: 24,
        name: "rds",
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      /* Disabled for cost-effectiveness */
      // {
      //   cidrMask: 24,
      //   name: 'application',
      //   subnetType: SubnetType.PRIVATE_WITH_NAT,
      // },
    ],
  });
}
