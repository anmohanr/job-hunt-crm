import * as cdk from 'aws-cdk-lib';
import { JobHuntCrmStack } from '../lib/job-hunt-crm-stack';

const app = new cdk.App();
new JobHuntCrmStack(app, 'JobHuntCrmStack', {
  domainName: 'anjanamohanraj.com',
  subdomain: 'jobs',
  sshKeyPairName: 'job-hunt-crm-key',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});
