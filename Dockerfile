FROM amazonlinux:2

# Install Node.js
RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash -
RUN yum install -y nodejs

# Install CDK and your CDK app
COPY .npmrc /root/.npmrc
RUN npm install -g aws-cdk@1.96.0
RUN npm install -g @cuperman/cdk-serverless-site-infrastructure@0.1.3
RUN rm /root/.npmrc

# Set CDK app as the entrypoint
ENTRYPOINT ["cdk", "--app", "site"]
CMD ["--help"]
