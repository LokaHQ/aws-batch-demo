# AWS Batch Demo in CDK & Python

## Pre-requisites

* `node` and `yarn`
* aws access - `aws sts get-caller-identity`

## Useful commands for CDK (aws infrastructure)

* `yarn build`     compile typescript to js
* `yarn test`      perform the jest unit tests
* `yarn lint`      lint the code
* `yarn prettier`  check for well edited text files
* `yarn deploy`    deploy this stack to your default AWS account/region
* `yarn diff`      compare deployed stack with current state
* `yarn synth`     emits the synthesized CloudFormation template

## Resources created

* AWS Batch
* Fargate web app with ALB
* S3

## Demo webapp

A demo webapp project in python Flask is provided (and deployed) in the [python-demoapp](./python-demoapp/) directory.

## FAQ

…


## CDK Bootstrap

Before using CDK in an AWS Account and Region, the Account + Region needs to be "cdk bootstraped"

```
# check if your aws is properly configured
aws sts get-caller-identity

# bootstrap cdk for the account and region
yarn cdk bootstrap
```

This **only needs to be done once** in the history of the account/region.
