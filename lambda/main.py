import json
import os
import boto3


def handler(event, context):
    table_name = os.environ.get("TABLE_NAME")
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    result = table.get_item(Key={"key": "visit_count"})
    item = result.get("Item")

    if item is None:
        visit_count = 0
    else:
        visit_count = item["value"]

    new_visit_count = visit_count + 1

    table.put_item(Item={"key": "visit_count", "value": new_visit_count})

    response_body = {
        "message": "Hello World!!",
        "version": os.environ.get("VERSION"),
        "visit_count": new_visit_count
    }
    return {
        "statusCode": 200,
        "body": json.dumps(response_body, default=str)
    }
