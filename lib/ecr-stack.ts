import * as cdk from 'aws-cdk-lib/core';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class EcrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'HelloWorldRepo', {
      repositoryName: 'aws-cicd-tutorial',
      // DESTROY + emptyOnDelete ensures `cdk destroy` can clean up the repo
      // even if it contains images — appropriate for a tutorial project.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // Export the full repository URI so GitHub Actions can resolve it
    // dynamically via `aws cloudformation describe-stacks` without
    // hardcoding account IDs or region strings anywhere in the workflow.
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: repository.repositoryUri,
      description: 'Full URI of the ECR repository (account.dkr.ecr.region.amazonaws.com/name)',
      exportName: 'EcrRepositoryUri',
    });
  }
}
