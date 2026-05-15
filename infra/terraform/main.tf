# Terraform IaC — Radbit SME Hub

## Provider: AWS Cape Town (af-south-1) + Cloudflare

### Directory Structure
```
infra/
├── main.tf              # Root module
├── variables.tf          # All input variables
├── outputs.tf            # Stack outputs
├── versions.tf           # Provider versions
├── modules/
│   ├── networking/       # VPC, subnets, NAT, security groups
│   ├── compute/          # ECS Fargate, ECR, load balancers
│   ├── database/         # RDS PostgreSQL, read replicas, ElastiCache Redis
│   ├── storage/          # S3 buckets, CloudFront distributions
│   ├── search/           # Meilisearch (ECS or EC2)
│   ├── cdn/              # Cloudflare zone configuration
│   ├── monitoring/       # CloudWatch, alarms, PagerDuty
│   └── ci_cd/            # CodePipeline, ECR lifecycle
├── environments/
│   ├── staging/          # Reduced capacity, shared services
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.conf
│   ├── prod/             # Production with DR
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.conf
│   └── dr/               # Warm standby in eu-west-1
│       ├── main.tf
│       └── terraform.tfvars
```

### versions.tf
```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.20"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  backend "s3" {
    # Configured per environment
  }
}
```

### variables.tf
```hcl
variable "environment" {
  description = "Environment name (staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "Primary AWS region"
  type        = string
  default     = "af-south-1"
}

variable "dr_aws_region" {
  description = "DR AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "domain_name" {
  description = "Primary domain (e.g., radbitsmehub.co.zw)"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "app_instance_count" {
  description = "Number of ECS tasks"
  type        = number
  default     = 2
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "meilisearch_instance_type" {
  description = "Meilisearch EC2 instance type"
  type        = string
  default     = "t4g.medium"
}

variable "enable_dr" {
  description = "Enable disaster recovery replica"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default = {
    Project   = "radbit-sme-hub"
    ManagedBy = "terraform"
  }
}
```

### main.tf (Primary Region — af-south-1)
```hcl
module "networking" {
  source = "./modules/networking"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = ["af-south-1a", "af-south-1b"]
  tags        = var.tags
}

module "database" {
  source = "./modules/database"

  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  subnet_ids        = module.networking.private_subnet_ids
  instance_class    = var.db_instance_class
  allocated_storage = var.environment == "prod" ? 100 : 20
  engine_version    = "15.4"
  multi_az          = var.environment == "prod"
  enable_dr         = var.enable_dr
  dr_region         = var.dr_aws_region
  tags              = var.tags
}

module "redis" {
  source = "./modules/redis"

  environment          = var.environment
  vpc_id               = module.networking.vpc_id
  subnet_ids           = module.networking.private_subnet_ids
  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "prod" ? 2 : 1
  tags                 = var.tags
}

module "compute" {
  source = "./modules/compute"

  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  app_count          = var.app_instance_count
  redis_endpoint     = module.redis.endpoint
  database_url       = module.database.endpoint
  domain_name        = var.domain_name
  tags               = var.tags
}

module "storage" {
  source = "./modules/storage"

  environment           = var.environment
  domain_name           = var.domain_name
  cloudflare_zone_id    = var.cloudflare_zone_id
  tags                  = var.tags
}

module "search" {
  source = "./modules/search"

  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  subnet_ids            = module.networking.private_subnet_ids
  instance_type         = var.meilisearch_instance_type
  database_url          = module.database.endpoint
  tags                  = var.tags
}

module "monitoring" {
  source = "./modules/monitoring"

  environment       = var.environment
  alb_arn           = module.compute.alb_arn
  db_cluster_arn    = module.database.cluster_arn
  redis_cluster_arn = module.redis.cluster_arn
  tags              = var.tags
}

module "cdn" {
  source = "./modules/cdn"

  environment        = var.environment
  domain_name        = var.domain_name
  cloudflare_zone_id = var.cloudflare_zone_id
  s3_bucket_id       = module.storage.assets_bucket_id
  alb_dns_name       = module.compute.alb_dns_name
  tags               = var.tags
}
```

### environments/prod/terraform.tfvars
```hcl
environment           = "prod"
aws_region            = "af-south-1"
dr_aws_region         = "eu-west-1"
domain_name           = "app.radbitsmehub.co.zw"
cloudflare_zone_id    = "your-zone-id"

db_instance_class     = "db.r6g.large"
app_instance_count    = 4
redis_node_type       = "cache.r6g.large"
meilisearch_instance_type = "r6g.large"
enable_dr             = true

tags = {
  Project   = "radbit-sme-hub"
  Environment = "prod"
  ManagedBy = "terraform"
}
```

### environments/staging/terraform.tfvars
```hcl
environment           = "staging"
aws_region            = "af-south-1"
domain_name           = "staging.radbitsmehub.co.zw"
cloudflare_zone_id    = "your-zone-id"

db_instance_class     = "db.t4g.small"
app_instance_count    = 1
redis_node_type       = "cache.t4g.micro"
meilisearch_instance_type = "t4g.small"
enable_dr             = false

tags = {
  Project   = "radbit-sme-hub"
  Environment = "staging"
  ManagedBy = "terraform"
}
```

### modules/networking/main.tf
```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, { Name = "${var.environment}-vpc" })
}

resource "aws_subnet" "public" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, { Name = "${var.environment}-public-${count.index}" })
}

resource "aws_subnet" "private" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, { Name = "${var.environment}-private-${count.index}" })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = merge(var.tags, { Name = "${var.environment}-igw" })
}

resource "aws_nat_gateway" "main" {
  count         = length(var.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.tags, { Name = "${var.environment}-nat-${count.index}" })
}

resource "aws_eip" "nat" {
  count = length(var.azs)
  domain = "vpc"
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, { Name = "${var.environment}-public-rt" })
}

resource "aws_route_table_association" "public" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "alb" {
  name        = "${var.environment}-alb-sg"
  description = "ALB security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.environment}-alb-sg" })
}

resource "aws_security_group" "ecs" {
  name        = "${var.environment}-ecs-sg"
  description = "ECS tasks security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.environment}-ecs-sg" })
}
```

### modules/compute/main.tf
```hcl
resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.environment}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "nextjs-app"
      image = "${aws_ecr_repository.app.repository_url}:latest"
      portMappings = [{ containerPort = 3000 }]
      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = "redis://${var.redis_endpoint}:6379" },
        { name = "GEMINI_API_KEY", valueFrom = "${aws_secretsmanager_secret.api_key.arn}:GEMINI_API_KEY::" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = var.tags
}

resource "aws_ecs_service" "app" {
  name            = "${var.environment}-app-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.ecs.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "nextjs-app"
    container_port   = 3000
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  tags = var.tags
}

resource "aws_lb" "app" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  tags = var.tags
}

resource "aws_lb_target_group" "app" {
  name        = "${var.environment}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = var.tags
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
```

### Cloudflare CDN Configuration
```hcl
resource "cloudflare_zone_settings_override" "main" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl                       = "strict"
    min_tls_version           = "1.2"
    http2                     = "on"
    http3                     = "on"
    brotli                    = "on"
    polish                    = "lossy"
    minify {
      html = "on"
      css  = "on"
      js   = "on"
    }
    security_header {
      enabled            = true
      strict_transport_security {
        enabled          = true
        max_age          = 31536000
        include_subdomains = true
        preload          = true
      }
    }
  }
}

resource "cloudflare_page_rule" "api_cache" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/api/*"
  priority = 1

  actions {
    cache_level         = "standard"
    edge_cache_ttl      = 300
    bypass_cache_on_cookie = "session"
  }
}

resource "cloudflare_page_rule" "static_cache" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/_next/static/*"
  priority = 2

  actions {
    cache_level    = "cache_everything"
    edge_cache_ttl = 31536000
  }
}

resource "cloudflare_argo" "main" {
  zone_id = var.cloudflare_zone_id
  tiered_caching = "on"
  smart_routing  = "on"
}
```

### outputs.tf
```hcl
output "alb_dns_name" {
  value = module.compute.alb_dns_name
}

output "cloudfront_domain" {
  value = module.storage.cloudfront_domain
}

output "database_endpoint" {
  value = module.database.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value = module.redis.endpoint
  sensitive = true
}

output "ecr_repository_url" {
  value = module.compute.ecr_repository_url
}

output "meilisearch_url" {
  value = module.search.endpoint
  sensitive = true
}
```

## Deployment Commands

### Staging (full deploy < 30 min)
```bash
cd infra/environments/staging
terraform init -backend-config=backend.conf
terraform plan -out=tfplan
terraform apply tfplan
```

### Production
```bash
cd infra/environments/prod
terraform init -backend-config=backend.conf
terraform plan -out=tfplan
terraform apply tfplan
```

### CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test

  build-and-deploy:
    needs: [typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
          aws-region: af-south-1
      - name: Build and push Docker image
        run: |
          aws ecr get-login-password | docker login --password-stdin ${{ secrets.ECR_REPOSITORY }}
          docker build -t radbit-app .
          docker tag radbit-app:latest ${{ secrets.ECR_REPOSITORY }}:latest
          docker push ${{ secrets.ECR_REPOSITORY }}:latest
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prod-cluster --service prod-app-service --force-new-deployment
```
