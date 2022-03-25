# Demo web application in Flask to use with AWS Batch

The web app …

```
# build docker image
docker build -t aws-batch-demo .

# runs the web app by default
docker run -it --rm -p 5000:5000 -e JOB_DEFINITION=dummy -e JOB_QUEUE=dummy aws-batch-demo

# run the compute job
docker run -it --rm aws-batch-demo /app/bin/demoapp-compute --help
```
