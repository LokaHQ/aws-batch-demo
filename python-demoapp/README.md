# Demo web application in Flask to use with AWS Batch

The demo application has two parts, a **web** application to show a simple form and
submit a Job to AWS Batch, and a **compute** program that runs the jobs. For simplicity,
in this case they are both packaged in a single Docker image (see the included `Dockerfile`).
In more complex scenarios, the two programs can be separate Docker images.

To build the image, just do a normal docker build:
```
docker build -t aws-batch-demo . # or "python-demoapp" from the root of this repository
```

The image is built using best practices of packaging Python applications.


## Web app

To test run the demo web application:
```
  docker run -it --rm \
    -e JOB_DEFINITION=dummy -e JOB_QUEUE=dummy -e SECRET_KEY=random-string \
    -p 5000:5000 \
    aws-batch-demo
```



## Compute job

The compute part of the application is standard Python cli program, the input parameters
are specified on the command line:

```
$ docker run -it --rm aws-batch-demo /app/bin/demoapp-compute --help
Usage: demoapp-compute [OPTIONS]

  Simple program that greets NAME for a total of COUNT times.

Options:
  --sleep INTEGER  Time to sleep in seconds
  --count INTEGER  Number of greetings.
  --name TEXT      The person to greet.  [required]
  --help           Show this message and exit.
```
