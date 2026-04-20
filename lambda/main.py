import json
import os


def handler(event, context):
    response_body = {
        "message": "Hello World!!",
        "version": os.environ.get("VERSION")
    }
    return {
        "statusCode": 200,
        "body": json.dumps(response_body)
    }
