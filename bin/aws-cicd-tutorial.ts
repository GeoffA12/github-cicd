#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EcrStack } from '../lib/stacks/ecr-stack';
import { AwsCicdTutorialStack } from '../lib/stacks/aws-cicd-tutorial-stack';
import { AuthStack } from '../lib/stacks/auth-stack';

const app = new cdk.App();

// EcrStack must be deployed before AwsCicdTutorialStack so the ECR repository
// exists by the time the docker-publish workflow runs.
// deploy_dev.yml deploys these two stacks explicitly in this order.
new AuthStack(app, 'AuthStack', {});

new EcrStack(app, 'EcrStack', {});

new AwsCicdTutorialStack(app, 'AwsCicdTutorialStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
