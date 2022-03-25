FROM python:3.10 as builder

WORKDIR /src/
COPY pyproject.toml setup.cfg /src/
COPY demoapp /src/demoapp

ENV PYTHONUSERBASE=/app
RUN pip install --user /src


# Runtime container image for both the Web App and the AWS Batch compute image
FROM python:3.10-slim

COPY --from=builder /app/ /app/

ENV PYTHONUSERBASE=/app
ENV FLASK_APP=demoapp.webapp:app
ENV HTTP_PORT=5000

# Default to the web app, for the Batch Job we'll override it to `/app/bin/demoapp-compute`

# WARNING: This is a development server. Do not use it in a production deployment.
CMD /app/bin/flask run --host=0.0.0.0 --port $HTTP_PORT
