#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SiteStack } from '../lib/site-stack';

function requireContext(scope: cdk.Construct, name: string) {
  const value = scope.node.tryGetContext(name);
  if (typeof value !== 'undefined') {
    return value;
  }
  throw new Error(`${name} undefined`);
}

const app = new cdk.App();

new SiteStack(app, 'Site', {
  hostedZoneId: requireContext(app, 'hostedZoneId'),
  hostedZoneName: requireContext(app, 'hostedZoneName'),
  domainName: requireContext(app, 'domainName')
});
