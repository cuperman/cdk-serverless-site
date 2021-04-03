import { expect as expectCDK, matchTemplate, MatchStyle, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { SiteStack } from '../lib/site-stack';

describe('SiteStack', () => {
  const app = new cdk.App();
  const stack = new SiteStack(app, 'MyTestStack', {
    hostedZoneId: '1234',
    hostedZoneName: 'foo.com',
    domainName: 'mydomain.foo.com'
  });

  it('has an s3 bucket', () => {
    expectCDK(stack).to(haveResource('AWS::S3::Bucket'));
  });
});
