# 2048 Game with AWS ECS Fargate CI/CD Pipeline

A containerized 2048 game deployed on AWS ECS Fargate with complete CI/CD automation using GitHub Actions.

## Architecture

- **Frontend**: HTML/CSS/JavaScript 2048 game
- **Container**: Dockerized with Nginx
- **Infrastructure**: AWS ECS Fargate with Application Load Balancer
- **CI/CD**: GitHub Actions for automated build, test, and deployment

## Quick Setup

### 1. GitHub Secrets Configuration
Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_ACCOUNT_ID` - Your AWS account ID
- `AWS_REGION` - AWS region (us-east-1)
- `DOMAIN_NAME` - Your domain (fozdigitalz.com)
- `SUBDOMAIN` - Game subdomain (play-2048)
- `ECR_REPOSITORY` - ECR repo name (2048-game)
- `ECS_CLUSTER` - ECS cluster name (2048-cluster)
- `ECS_SERVICE` - ECS service name (2048-service)
- `ECS_TASK_DEFINITION` - Task definition name (2048-task-def)
- `CONTAINER_NAME` - Container name (2048-container)
- `VPC_ID` - Your existing VPC ID
- `CERTIFICATE_ARN` - Your ACM certificate ARN
- `HOSTED_ZONE_ID` - Your Route53 hosted zone ID

### 2. Prerequisites
- Route53 hosted zone for `fozdigitalz.com`
- ACM certificate for `*.fozdigitalz.com` in us-east-1

### 3. Deploy
Push to main branch to trigger automatic deployment.

### 4. Manual Infrastructure Setup (Optional)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## Local Development

```bash
# Run tests
npm test

# Start local server
npm start
# Visit http://localhost:8000

# Build Docker image
docker build -t 2048-game .
docker run -p 8080:80 2048-game
```

## Access the Game
Once deployed, access your game at: **https://play-2048.fozdigitalz.com**

## Game Controls
- Use arrow keys to move tiles
- Combine tiles with same numbers to reach 2048
- Click "New Game" to restart

## Infrastructure Components
- **ECR**: Container registry
- **ECS Fargate**: Serverless container hosting
- **ALB**: Load balancer for high availability
- **VPC**: Isolated network environment
- **CloudWatch**: Logging and monitoring

## CI/CD Pipeline
1. **Test**: Validates game logic
2. **Infrastructure**: Deploys/updates AWS resources via Terraform
3. **Build**: Creates Docker image
4. **Push**: Uploads to ECR
5. **Deploy**: Updates ECS service

The pipeline automatically deploys on every push to the main branch with HTTPS support and custom domain.