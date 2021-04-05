# CDK Serverless Site

An example app as an excuse to optimize packaging the deployment of a CDK app

## Development

Useful commands:

```bash
yarn lerna bootstrap
yarn lerna publish
```

## Building the Docker image

In order to authenticate with Github Packages, a .npmrc file needs to be in your working directory when building the Docker image. It should look something like this:

```npmrc
//npm.pkg.github.com/:_authToken=PERSONAL_ACCESS_TOKEN_HERE
@cuperman:registry=https://npm.pkg.github.com/
```

To build and publish the docker image, use commands like this:

```bash
docker build -t docker.pkg.github.com/cuperman/cdk-serverless-site/cdk:0.1.3 .
docker push docker.pkg.github.com/cuperman/cdk-serverless-site/cdk:0.1.3
```

## Deployment

Use docker to deploy to AWS:

```bash
docker run -t docker.pkg.github.com/cuperman/cdk-serverless-site/cdk:0.1.3 \
    synth \
    --context hostedZoneId=foo \
    --context hostedZoneName=jeffws.com \
    --context domainName=foo.jeffws.com

# deploy using file-based credentials
docker run -t -v ~/.aws:/root docker.pkg.github.com/cuperman/cdk-serverless-site/cdk:0.1.3 \
    deploy \
    --profile my-profile \
    --region us-east-1 \
    --context hostedZoneId=uq93458q34 \
    --context hostedZoneName=jeffws.com \
    --context domainName=site.jeffws.com

# deploy using aws-vault
aws-vault exec my-profile --no-session -- \
docker run -t -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY docker.pkg.github.com/cuperman/cdk-serverless-site/cdk:0.1.3 \
    deploy \
    --region us-east-1 \
    --context hostedZoneId=uq93458q34 \
    --context hostedZoneName=jeffws.com \
    --context domainName=site.jeffws.com
```
