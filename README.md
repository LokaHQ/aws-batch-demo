# `AWS Batch demo`

This project demonstrates the use of [AWS Batch](https://aws.amazon.com/batch/)
with full infrastructure written in AWS CDK (typescript) and a python application
which consists of a web part and compute part that runs in AWS Batch.

Infrastructure diagram:
![infrastructure-diagram](https://user-images.githubusercontent.com/92797652/163819686-9a0974ba-068a-4d81-b7d1-372b23ef8e74.png)

Go to the `./infrastrucure/` directory for more info about the CDK setup and source code.

Go to the `./python-demoapp/` directory for the demo application.

Github actions are configured to test the infrastructure code using jest snapshots, eslint and prettier.
Continuous deployment is outside of the scope of the demonstration.
