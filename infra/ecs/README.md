# ECS Fargate Deployment

## Prerequisites

1. AWS account with ECS, ECR, Secrets Manager access
2. Create ECR repository: `aws ecr create-repository --repository-name levelup-api`
3. Create ECS cluster: `aws ecs create-cluster --cluster-name levelup-production`
4. Create AWS Secrets Manager secrets for each valueFrom ARN in task-definition.json
5. Create IAM roles: ecsTaskExecutionRole (with AmazonECSTaskExecutionRolePolicy + SecretsManagerReadWrite) and ecsTaskRole
6. Create VPC, subnets, security groups, and ALB target group
7. Replace all ACCOUNT_ID, REGION, SUBNET_ID_*, SECURITY_GROUP_ID placeholders

## First Deploy

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

# Build and push
docker build -t levelup-api apps/api/
docker tag levelup-api:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/levelup-api:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/levelup-api:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://infra/ecs/task-definition.json

# Create service
aws ecs create-service --cli-input-json file://infra/ecs/service.json
```

Subsequent deploys are handled automatically by .github/workflows/deploy.yml.
