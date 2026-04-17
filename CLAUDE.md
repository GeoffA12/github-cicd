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

This is an AWS CDK v2 project in TypeScript for building CI/CD infrastructure.

- **`bin/aws-cicd-tutorial.ts`** — CDK app entry point; instantiates the stack. Uncomment the `env` property to target a specific AWS account/region.
- **`lib/aws-cicd-tutorial-stack.ts`** — The main `AwsCicdTutorialStack` class where all AWS resources are defined.
- **`test/`** — Jest tests using `aws-cdk-lib/assertions` (`Template.fromStack`) to assert on synthesized CloudFormation resources.

The stack is currently environment-agnostic (no account/region pinned). All CDK feature flags are enabled in `cdk.json` context, reflecting the latest CDK best practices.

Tests use `aws-cdk-lib/testhelpers/jest-autoclean` to reset CDK state between tests.
