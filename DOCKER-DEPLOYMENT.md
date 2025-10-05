# Docker & ECR Deployment Guide

This guide covers deploying the Star Wars API application using Docker and AWS ECR (Elastic Container Registry).

## Overview

The application is containerized using Docker and automatically pushed to AWS ECR when:
- ✅ All tests pass (backend + frontend)
- ✅ Code quality checks pass
- ✅ Build validation succeeds
- ✅ Push is to `master` branch

## Architecture

```
GitHub Push (master) → CI Tests → Build Docker → Push to ECR
                         ↓
                    All Pass? → Deploy to AWS
```

## Setup Instructions

### 1. Create ECR Repository with Terraform

```bash
cd terraform

# Initialize Terraform (if not already done)
terraform init

# Apply ECR configuration
terraform apply -target=aws_ecr_repository.star_wars_api
```

This creates:
- ECR repository: `star-wars-api`
- Lifecycle policy: Keep last 10 images
- IAM user for GitHub Actions
- Access credentials

### 2. Get AWS Credentials

After Terraform apply, get the credentials:

```bash
# Get access key ID
terraform output github_actions_access_key_id

# Get secret access key
terraform output -raw github_actions_secret_access_key

# Get ECR repository URL
terraform output ecr_repository_url
```

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to: `https://github.com/YOUR_USERNAME/star-wars-api/settings/secrets/actions`

2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID` - From terraform output
   - `AWS_SECRET_ACCESS_KEY` - From terraform output
   - `AWS_REGION` - Your AWS region (e.g., `us-east-1`)

### 4. Push to Master

Once secrets are configured, push to master:

```bash
git push origin master
```

The GitHub Actions workflow will:
1. Run all tests
2. Build Docker image
3. Tag with commit SHA and `latest`
4. Push to ECR

## Dockerfile Details

### Multi-stage Build

```dockerfile
# Build stage - Install dependencies
FROM node:18-alpine AS builder
COPY package*.json ./
RUN npm ci --only=production

# Production stage - Minimal image
FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY server.js public ./
```

### Features

- ✅ **Multi-stage build** - Smaller final image (~150MB)
- ✅ **Non-root user** - Security best practice
- ✅ **Health check** - Container health monitoring
- ✅ **Alpine Linux** - Minimal base image

### Image Size

- Base image: ~150MB
- With dependencies: ~180MB
- Final optimized: ~160MB

## GitHub Actions Workflow

### Docker Build Job

Only runs on `master` branch push after all tests pass:

```yaml
docker-build-push:
  needs: [backend-tests, frontend-tests, code-quality, build]
  if: github.ref == 'refs/heads/master'
  steps:
    - Configure AWS credentials
    - Login to ECR
    - Build and push Docker image
```

### Image Tags

Each push creates two tags:
- `<commit-sha>` - Specific version (e.g., `a1b2c3d`)
- `latest` - Always points to most recent

## Running Locally with Docker

### Build Image

```bash
docker build -t star-wars-api .
```

### Run Container

```bash
docker run -p 3000:3000 star-wars-api
```

### With Environment Variables

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  star-wars-api
```

### Run from ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Pull and run
docker pull YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/star-wars-api:latest
docker run -p 3000:3000 YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/star-wars-api:latest
```

## ECR Repository Management

### View Images

```bash
aws ecr describe-images --repository-name star-wars-api
```

### List Tags

```bash
aws ecr list-images --repository-name star-wars-api
```

### Delete Specific Image

```bash
aws ecr batch-delete-image \
  --repository-name star-wars-api \
  --image-ids imageTag=old-tag
```

### Lifecycle Policy

Automatically keeps only the last 10 images to save storage costs.

## Deployment Options

### Option 1: EC2 with Docker

Update `user-data.sh` to pull from ECR:

```bash
# Install Docker
yum install -y docker
service docker start

# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ECR_URL

# Run container
docker run -d -p 80:3000 ECR_URL/star-wars-api:latest
```

### Option 2: ECS (Elastic Container Service)

Create ECS cluster and service (future enhancement):

```hcl
resource "aws_ecs_cluster" "main" {
  name = "star-wars-api-cluster"
}

resource "aws_ecs_service" "app" {
  name            = "star-wars-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"
}
```

### Option 3: Lambda + ECR (Serverless)

Package as Lambda container (requires modifications).

## Costs

### ECR Storage
- **Free Tier**: 500MB/month for 12 months
- **After**: $0.10 per GB/month
- **Our usage**: ~0.5GB (~$0.05/month)

### Data Transfer
- **To internet**: $0.09 per GB (after 1GB free)
- **Within AWS**: Free

**Estimated cost**: ~$0.10-0.50/month

## Security

### Image Scanning

ECR automatically scans images for vulnerabilities:

```bash
# View scan results
aws ecr describe-image-scan-findings \
  --repository-name star-wars-api \
  --image-id imageTag=latest
```

### Best Practices

✅ Non-root user in container
✅ Multi-stage builds (smaller attack surface)
✅ Regular image updates
✅ Scan on push enabled
✅ Lifecycle policies (remove old images)
✅ IAM least privilege access

## Troubleshooting

### Build Fails in GitHub Actions

1. Check secrets are set correctly
2. Verify AWS credentials have ECR permissions
3. Check Dockerfile syntax: `docker build -t test .`

### Cannot Push to ECR

1. Verify IAM permissions
2. Check ECR repository exists
3. Ensure region is correct

### Image Too Large

1. Use `.dockerignore` to exclude files
2. Use multi-stage builds
3. Choose alpine base images
4. Remove dev dependencies

### Health Check Failing

1. Ensure app listens on correct port
2. Check app starts successfully
3. Verify health check endpoint works

## Monitoring

### CloudWatch Container Insights

Enable for ECS (if using):

```hcl
resource "aws_ecs_cluster" "main" {
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
```

### Application Logs

View logs in CloudWatch:

```bash
aws logs tail /aws/ecs/star-wars-api --follow
```

## Next Steps

1. **Set up ECS/Fargate** - Serverless container orchestration
2. **Add Auto Scaling** - Scale based on demand
3. **CI/CD for Deployment** - Auto-deploy on push
4. **Blue/Green Deployments** - Zero-downtime updates
5. **Container Monitoring** - CloudWatch Container Insights

## Commands Reference

```bash
# Build image
docker build -t star-wars-api .

# Run locally
docker run -p 3000:3000 star-wars-api

# Tag for ECR
docker tag star-wars-api:latest ECR_URL/star-wars-api:latest

# Push to ECR
docker push ECR_URL/star-wars-api:latest

# Pull from ECR
docker pull ECR_URL/star-wars-api:latest

# View running containers
docker ps

# View logs
docker logs CONTAINER_ID

# Stop container
docker stop CONTAINER_ID
```

## Support

For issues:
1. Check GitHub Actions logs
2. Review ECR console for images
3. Test Docker build locally
4. Verify AWS permissions
