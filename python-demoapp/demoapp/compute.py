"""
  Example python program started from CLI

  This is the script that's executed in the AWS Batch environment
"""
import click
import boto3
import time


@click.command()
@click.option("--sleep", default=10, help="Time to sleep in seconds")
@click.option("--count", default=1, help="Number of greetings.")
@click.option("--name", required=True, help="The person to greet.")
def main(sleep, count, name):
    """Simple program that greets NAME for a total of COUNT times."""
    for x in range(count):
        click.echo(f"Hello {name}!")

    click.echo("Do some real pretend work…")
    time.sleep(sleep)
    click.echo("Done!")


if __name__ == "__main__":
    main()
