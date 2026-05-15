# Cost Estimates — Radbit SME Hub

## Assumptions
- Region: AWS af-south-1 (Cape Town) — ~20% premium over us-east-1
- CDN: Cloudflare Pro ($20/mo flat)
- Database: PostgreSQL 15 on RDS
- AI costs: Gemini 2.0 Flash ($0.075/1M input, $0.30/1M output tokens)
- Storage: S3 Standard + CloudFront
- Compute: ECS Fargate (ARM/Graviton where available)

---

## 10,000 MAU (Monthly Active Users)

| Category | Service | Monthly Cost |
|---|---|---|
| **Compute** | ECS Fargate: 2x t4g.small tasks | $35 |
| **Database** | RDS t4g.small (1 instance) | $25 |
| **Cache** | ElastiCache t4g.micro | $15 |
| **Storage** | S3 Standard (~10GB) + CloudFront | $10 |
| **Search** | Meilisearch t4g.small (single) | $20 |
| **CDN** | Cloudflare Pro | $20 |
| **AI** | Gemini API (~50k requests/mo) | $2 |
| **Monitoring** | CloudWatch + PagerDuty | $25 |
| **Misc** | NAT Gateway, EIP, data transfer | $30 |
| **Total** | | **$182/mo** (≈ $0.018/user) |

---

## 50,000 MAU

| Category | Service | Monthly Cost |
|---|---|---|
| **Compute** | ECS Fargate: 4x t4g.small tasks + ALB | $120 |
| **Database** | RDS t4g.medium (multi-AZ) | $100 |
| **Cache** | ElastiCache t4g.small + replica | $60 |
| **Storage** | S3 Standard (~50GB) + CloudFront | $40 |
| **Search** | Meilisearch t4g.medium (2-node cluster) | $80 |
| **CDN** | Cloudflare Pro | $20 |
| **AI** | Gemini API (~250k requests/mo) | $10 |
| **Monitoring** | CloudWatch + PagerDuty + X-Ray | $50 |
| **Misc** | NAT Gateway, EIP, data transfer | $80 |
| **Total** | | **$560/mo** (≈ $0.011/user) |

---

## 100,000 MAU

| Category | Service | Monthly Cost |
|---|---|---|
| **Compute** | ECS Fargate: 8x t4g.medium + ALB | $400 |
| **Database** | RDS r6g.large (multi-AZ, read replica in ZA) | $350 |
| **Cache** | ElastiCache r6g.large cluster (3 nodes) | $250 |
| **Storage** | S3 Standard (~150GB) + CloudFront | $100 |
| **Search** | Meilisearch r6g.large (3-node cluster) | $300 |
| **CDN** | Cloudflare Business (custom caching rules) | $200 |
| **AI** | Gemini API (~500k requests/mo) | $20 |
| **Monitoring** | CloudWatch + PagerDuty + DataDog | $200 |
| **Misc** | NAT Gateway, EIP, data transfer, DR replica | $250 |
| **Total** | | **$2,070/mo** (≈ $0.020/user) |

---

## One-Time Setup Costs

| Item | Cost |
|---|---|
| Terraform + CI/CD setup | $1,000 (dev time) |
| Load testing suite (k6) | $200 (dev time) |
| Security audit | $2,000 |
| Accessibility audit | $1,000 |
| Device lab (5 devices) | $500 |
| **Total** | **$4,700** |

---

## Cost Optimization Levers

| Lever | Savings | Impact |
|---|---|---|
| Graviton (ARM) instances | ~15% compute cost | No impact |
| Reserved Instances (1yr) | ~30% on RDS/ElastiCache | Commitment required |
| S3 Infrequent Access for old AI outputs | ~40% storage cost | Slightly slower retrieval |
| Meilisearch → OpenSearch (if already in AWS) | ~$50-100/mo | Less specialized search |
| Cloudflare Argo Smart Routing | Included in Pro | Faster, no extra cost |
| Bulk AI token pre-purchase | ~20% AI cost | Requires estimation |
