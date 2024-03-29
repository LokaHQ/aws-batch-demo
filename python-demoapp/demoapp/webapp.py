from flask import Flask, request, render_template, redirect, flash, url_for
import boto3
import os, uuid

app = Flask(__name__)

## Configuration
app.config.update(
    {
        "JOB_DEFINITION": os.environ["JOB_DEFINITION"],  # name or Arn
        "JOB_QUEUE": os.environ["JOB_QUEUE"],  # name, name:revision or Arn
        # allows us to relocate the web application on another url root:
        "APPLICATION_ROOT": os.environ.get("FLASK_APPLICATION_ROOT", ""),
    }
)
app.secret_key = os.environ["SECRET_KEY"]


@app.route("/", methods=["GET"])
def index():
    """
    Shows a html form with a single input field and a list of the jobs in AWS Batch, grouped by their status
    """
    return render_template(
        "index.html",
        job_name=uuid.uuid4(),
        jobs_grouped_by_status=list_jobs_by_status(
            app.config["JOB_DEFINITION"],
            app.config["JOB_QUEUE"],
        ),
    )


@app.route("/submit", methods=["POST"])
def submit_job():
    """
    Handles the POST-ed form and submits a job to AWS Batch

    The form data is expected to contain a "job-name" and a "text-input-data" fields.

    ref: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/batch.html#Batch.Client.submit_job
    """
    job_name = request.form["job-name"]
    data = request.form["text-input-data"]

    client = boto3.client("batch")
    response = client.submit_job(
        jobName=job_name,
        jobDefinition=app.config["JOB_DEFINITION"],
        jobQueue=app.config["JOB_QUEUE"],
        parameters={"inputdata": data},
        propagateTags=True,
    )
    job_id = response["jobId"]
    flash(f'Job "{job_id}" submited!')
    return redirect(url_for(".index"))


@app.route("/healthcheck", methods=["GET"])
def healthcheck():
    """dummy health check route."""
    # client = boto3.client('sts')
    # client.get_caller_identity()
    return "ok\n"


def list_jobs_by_status(job_definition, job_queue):
    """
    Returns a dictionary of all jobs, grouped by their status.

    Example:
    {
        "RUNNING": [ job1…, job2… ],
        "PENDING": [ job3…, job4… ],
    }

    ref: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/batch.html#Batch.Client.list_jobs
    """
    client = boto3.client("batch")
    paginator = client.get_paginator("list_jobs")
    response_iterator = paginator.paginate(
        jobQueue=job_queue,
        filters=[{"name": "JOB_DEFINITION", "values": [job_definition]}],
    )

    jobs = {}  # 'status' => [jobs…]
    for page in response_iterator:
        for job in page["jobSummaryList"]:
            # group by status
            jobs.setdefault(job["status"], []).append(job)
    return jobs
