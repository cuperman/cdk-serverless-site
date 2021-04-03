import * as path from 'path';

import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';

const FRONTEND_PATH = path.dirname(require.resolve('@cuperman/cdk-serverless-site-frontend/package.json'));

export interface SiteStackProps extends cdk.StackProps {
  readonly hostedZoneId: string;
  readonly hostedZoneName: string;
  readonly domainName: string;
}

export class SiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const siteOai = new cloudfront.OriginAccessIdentity(this, 'SiteOai');

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName
    });

    const siteCertificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      hostedZone,
      domainName: props.domainName
    });

    const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: siteBucket,
            originAccessIdentity: siteOai
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              defaultTtl: cdk.Duration.days(1),
              maxTtl: cdk.Duration.days(365)
            }
          ]
        }
      ],
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(siteCertificate, {
        aliases: [props.domainName]
      })
    });

    new s3Deployment.BucketDeployment(this, 'SiteDeployment', {
      sources: [s3Deployment.Source.asset(path.join(FRONTEND_PATH, 'build'))],
      destinationBucket: siteBucket,
      distribution: siteDistribution,
      prune: true,
      retainOnDelete: false
    });

    new route53.ARecord(this, 'SiteARecord', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(siteDistribution))
    });

    new route53.AaaaRecord(this, 'SiteAaaaRecord', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(siteDistribution))
    });
  }
}
