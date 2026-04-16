import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class AwsCicdTutorialStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, 'HelloWorldFunction', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    const fnUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        allowedMethods: [lambda.HttpMethod.ALL],
      },
    });

    new cdk.CfnOutput(this, 'Url', {
      value: fnUrl.url,
    });
  }
}
