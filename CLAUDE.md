# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build       # compile TypeScript to JS
npm run watch       # watch and recompile on changes
npm run test        # run Jest tests
npx cdk synth       # synthesize CloudFormation template
npx cdk diff        # compare deployed stack with current state
npx cdk deploy      # deploy stack to AWS
```

Run a single test file:
```bash
npx jest test/aws-cicd-tutorial.test.ts
```

Deploy a single stack:
```bash
npx cdk deploy AuthStack
npx cdk deploy EcrStack
npx cdk deploy AwsCicdTutorialStack
```

## Git Hooks

A pre-commit hook lives in `hooks/pre-commit`. It auto-increments the minor version in `.env` (e.g. `1.0` → `1.1`) and stages the file on every commit.

Install it after cloning:
```bash
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Project Purpose

This is a **demonstration project** for testing GitHub Actions workflows. The code is not production-facing and exists solely to provide a working CDK app to run CI/CD pipelines against. Prioritize clarity and simplicity over production concerns like cost optimization, security hardening, or operational robustness.

## Architecture

This is an AWS CDK v2 project in TypeScript. All stacks live in `lib/stacks/`. The app entry point (`bin/aws-cicd-tutorial.ts`) instantiates them in deployment order. Tests in `test/` use `aws-cdk-lib/assertions` (`Template.fromStack`) to assert on synthesized CloudFormation resources.

The app is environment-agnostic (no account/region pinned). All CDK feature flags are enabled in `cdk.json`. Tests use `aws-cdk-lib/testhelpers/jest-autoclean` to reset CDK state between tests.

### Stacks

**`AuthStack`** (`lib/stacks/auth-stack.ts`)
- GitHub OIDC provider (`token.actions.githubusercontent.com`) — allows GitHub Actions to authenticate to AWS without static credentials
- `GitHubCICDActionsRole` — IAM role assumed by GitHub Actions via OIDC, scoped to the `GeoffA12/github-cicd` repository
- `GitHubActionsAssumeRolePolicy` — customer-managed policy granting `sts:AssumeRole` on `*`
- `GitHubActionsECRPolicy` — customer-managed policy granting ECR read/write actions
- AWS-managed `AWSCloudFormationFullAccess` attached to the role

> **Note:** `AuthStack` must be deployed manually once before the GitHub Actions workflow can run. See `README.md` for details.

**`EcrStack`** (`lib/stacks/ecr-stack.ts`)
- ECR repository named `aws-cicd-tutorial` with `DESTROY` removal policy (safe to `cdk destroy`)
- Exports the full repository URI as a CloudFormation output (`EcrRepositoryUri`) so `docker-publish.yml` can resolve it dynamically without hardcoding account IDs

**`AwsCicdTutorialStack`** (`lib/stacks/aws-cicd-tutorial-stack.ts`)
- DynamoDB table with `key` (STRING) as partition key, `PAY_PER_REQUEST` billing
- Python 3.13 Lambda function (`lambda/main.py`) — returns a Hello World response with a version and a visit count that increments on each invocation, backed by the DynamoDB table
- Lambda function URL with `AuthType.NONE` and open CORS, exposed as a CloudFormation output (`Url`)
- `VERSION` is read from `.env` via `dotenv` at synth time and injected as a Lambda environment variable; `TABLE_NAME` is passed from the DynamoDB table

### Lambda (`lambda/main.py`)

Reads `VERSION` and `TABLE_NAME` from environment variables. On each invocation, gets the `visit_count` item from DynamoDB, increments it, writes it back, and returns it in the response body alongside the message and version.

## GitHub Actions Workflows

**`deploy_dev.yml`** — triggered on push to `main`
- Authenticates to AWS via OIDC using the role ARN stored in the `CICD_ACTIONS_ROLE_ARN` repository secret
- Caches `node_modules` by `package-lock.json` hash; skips `npm ci` on cache hit
- Deploys stacks in order: `AuthStack` → `EcrStack` → `AwsCicdTutorialStack`

**`docker-publish.yml`** — triggered after `deploy_dev.yml` succeeds on `main`, or manually via `workflow_dispatch`
- Authenticates via OIDC using the same `CICD_ACTIONS_ROLE_ARN` secret
- Resolves the ECR repository URI dynamically from the `EcrStack` CloudFormation output (avoids hardcoding account/region)
- Builds and pushes a Docker image tagged with the full git SHA and `latest`
- Uses ECR as a layer cache (`cache-from`/`cache-to`) to speed up subsequent builds
- For `workflow_run` events, only proceeds if the upstream deploy workflow succeeded
