# Welcome to your CDK TypeScript project

## Initial Setup

### Auth Stack — Manual One-Time Deployment

The `AuthStack` creates the IAM role (`GitHubCICDActionsRole`) that the GitHub Actions workflow assumes via OIDC to authenticate to AWS. Because `deploy_dev.yml` references this role in the `Configure AWS credentials` step — which runs before any CDK deployment — there is a chicken-and-egg dependency: the role must already exist in the target AWS account before the workflow can run successfully.

To resolve this, the `AuthStack` must be deployed **once manually** from your local machine using credentials that have sufficient IAM and CloudFormation permissions:

```bash
npx cdk deploy AuthStack
```

After this one-time deployment, the role exists in AWS and all subsequent deployments can be driven entirely by the GitHub Actions workflow. Future updates to `AuthStack` (e.g. policy changes) will be applied automatically by the workflow's `Deploy Auth stack` step.



This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
