from flask import Flask, request, render_template, redirect, flash, url_for
import boto3
import os, uuid

## Configuration
JOB_DEFINITION = os.environ['JOB_DEFINITION'] # name or Arn
JOB_QUEUE = os.environ['JOB_QUEUE'] # name, name:revision or Arn


app = Flask(__name__)

@app.route("/", methods=['GET'])
def index():
    return render_template(
        'index.html',
        job_name=uuid.uuid4(),
        jobs_grouped_by_status=list_jobs_by_status(JOB_DEFINITION, JOB_QUEUE)
    )


@app.route("/submit", methods=['POST'])
def submit_job():
    job_name = request.form['job_name']
    data = request.form['data']

    client = boto3.client('batch')
    response = client.submit_job(
        jobName=job_name,
        jobDefinition=JOB_DEFINITION,
        jobQueue=JOB_QUEUE,
        parameters={ "data": data },
        propagateTags=True,
    )
    job_id = response['jobId']
    flash(f'Job "{job_id}" submited!')
    return redirect(url_for('.index'))


'''
  Returns a dictionary of all jobs, grouped by their status.

  Example:
  {
      "RUNNING": [ job1…, job2… ],
      "PENDING": [ job3…, job4… ],
  }
'''
def list_jobs_by_status(job_definition, job_queue):
    client = boto3.client('batch')
    paginator = client.get_paginator('list_jobs')
    response_iterator = paginator.paginate(
        jobQueue=job_queue
    )

    jobs = {} # 'status' => [jobs…]
    for page in response_iterator:
        for job in page['jobSummaryList']:
            # group by status
            jobs.setdefault(job.status, []).append(job)
    return jobs
