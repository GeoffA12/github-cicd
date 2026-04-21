import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly githubOidcProvider: iam.OpenIdConnectProvider;
  public readonly githubActionsRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.githubOidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const assumeRolePolicy = new iam.ManagedPolicy(this, 'GitHubActionsAssumeRolePolicy', {
      managedPolicyName: 'GitHubActionsAssumeRolePolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: ['*'],
        }),
      ],
    });

    const ecrPolicy = new iam.ManagedPolicy(this, 'GitHubActionsECRPolicy', {
      managedPolicyName: 'GitHubActionsECRPolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ecr:StartImageScan',
            'ecr:GetSigningConfiguration',
            'ecr:UploadLayerPart',
            'ecr:ListImages',
            'ecr:BatchGetRepositoryScanningConfiguration',
            'ecr:CompleteLayerUpload',
            'ecr:BatchCheckLayerAvailability',
            'ecr:GetLifecyclePolicy',
            'ecr:PutSigningConfiguration',
            'ecr:PutLifecyclePolicy',
            'ecr:ListPullTimeUpdateExclusions',
            'ecr:DescribeImageScanFindings',
            'ecr:GetLifecyclePolicyPreview',
            'ecr:DescribeRegistry',
            'ecr:PutImageScanningConfiguration',
            'ecr:GetDownloadUrlForLayer',
            'ecr:DescribePullThroughCacheRules',
            'ecr:GetAuthorizationToken',
            'ecr:PutRegistryScanningConfiguration',
            'ecr:PutImage',
            'ecr:BatchImportUpstreamImage',
            'ecr:BatchGetImage',
            'ecr:DescribeImages',
            'ecr:InitiateLayerUpload',
            'ecr:GetRepositoryPolicy',
          ],
          resources: ['*'],
        }),
      ],
    });

    this.githubActionsRole = new iam.Role(this, 'GitHubCICDActionsRole', {
      roleName: 'GitHubCICDActionsRole',
      assumedBy: new iam.WebIdentityPrincipal(
        this.githubOidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': [
              'repo:GeoffA12/github-cicd:*',
              'repo:GeoffA12/github-cicd:*',
            ],
          },
        },
      ),
      managedPolicies: [
        assumeRolePolicy,
        ecrPolicy,
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCloudFormationFullAccess'),
      ],
    });
  }
}
