# Disaster Recovery Runbook

## Recovery Objectives
| Metric | Target |
|---|---|
| RPO (Recovery Point Objective) | 5 minutes |
| RTO (Recovery Time Objective) | 30 minutes |
| Data loss on failover | < 5 min of transactions |
| Testing cadence | Quarterly |

---

## Architecture

```
Primary: AWS af-south-1 (Cape Town)
  ├── RDS PostgreSQL (multi-AZ)
  ├── ECS Fargate (4 tasks)
  ├── ElastiCache Redis
  ├── S3 Standard
  └── Meilisearch

Replica (Warm Standby): AWS eu-west-1 (Frankfurt)
  ├── RDS PostgreSQL read replica (async)
  ├── ECS Fargate (2 tasks — reduced)
  ├── S3 Cross-region replication
  └── CloudFront alternate origin
```

## Failure Scenarios

### 1. Single AZ Failure (most likely in af-south-1)
**Detection:** CloudWatch alarm on RDS replica lag > 10s, or ECS task failure > 2 in 5 min
**Action:** Automatic — RDS multi-AZ failover, ECS replaces tasks in surviving AZ
**RTO:** < 2 minutes
**Runbook:**
1. Wait 60s for automatic failover
2. Verify: `aws rds describe-db-instances --db-instance-identifier radbit-prod | grep DBInstanceStatus`
3. Verify ECS auto-replaces tasks: `aws ecs list-tasks --cluster prod-cluster`
4. Check ALB target health: `aws elbv2 describe-target-health --target-group-arn <arn>`

### 2. Region Failure (af-south-1 unavailable)
**Detection:** Route53 health check fails for 3 consecutive checks (90s)
**Action:** Manual failover to eu-west-1 (DR)
**RTO:** < 30 minutes
**Runbook:**

```
Step 1: Verify region outage
  aws health describe-events --region af-south-1 --filter "eventTypeCodes=AWS_RDS_MAINTENANCE_SCHEDULED"

Step 2: Promote DR read replica to primary (5 min)
  aws rds promote-read-replica --db-instance-identifier radbit-dr
  # Wait until status is 'available'
  aws rds wait db-instance-available --db-instance-identifier radbit-dr

Step 3: Scale DR ECS tasks to production count (2 min)
  aws ecs update-service --cluster dr-cluster --service dr-app-service --desired-count 4

Step 4: Update DNS (Cloudflare) (1 min)
  # Change CNAME from primary ALB to DR ALB
  # Via Cloudflare API:
  curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"content": "dr-alb-123456.eu-west-1.elb.amazonaws.com"}'

Step 5: Update CloudFront origin to DR ALB (3 min)
  # Via AWS Console: CloudFront → Distributions → Edit Origin → Switch to DR ALB DNS

Step 6: Verify application health (2 min)
  curl -I https://app.radbitsmehub.co.zw/api/health
  # Expected: HTTP 200, response body: {"status":"healthy","region":"eu-west-1"}
```

### 3. Database Corruption
**Detection:** Application alerts (500 errors from DB queries, data integrity checks fail)
**Action:** Point-in-time recovery (PITR)
**RTO:** < 1 hour

```
Step 1: Stop application to prevent further writes
  aws ecs update-service --cluster prod-cluster --service prod-app-service --desired-count 0

Step 2: Identify recovery point
  # Find the latest clean snapshot or PITR timestamp
  aws rds describe-db-instances --db-instance-identifier radbit-prod | grep LatestRestorableTime

Step 3: Restore from PITR (15-30 min)
  aws rds restore-db-instance-to-point-in-time \
    --source-db-instance-identifier radbit-prod \
    --target-db-instance-identifier radbit-prod-restored \
    --restore-time "2026-05-15T14:30:00Z" \
    --db-instance-class db.r6g.large \
    --multi-az

Step 4: Promote restored DB, update application
  # Update DATABASE_URL in ECS task definition
  aws ecs update-service --cluster prod-cluster --service prod-app-service --desired-count 4
```

### 4. AI Service (Gemini) Outage
**Detection:** AI Orchestrator health check fails for Gemini endpoint
**Action:** Graceful degradation (no failover needed)
**RTO:** N/A — app continues with cached results

```
Step 1: Verify Gemini status
  curl -I https://generativelanguage.googleapis.com/v1/models
  # OR check https://status.cloud.google.com/

Step 2: The application automatically switches to degraded mode:
  - Assessment summaries: Show last generated result with "AI unavailable" notice
  - AI Toolkit: Use template-based responses
  - AI Mentor: Show "Service temporarily unavailable" with email contact
  - Dashboard insights: Use cached version (4-hour TTL from current cache)

Step 3: Queue AI tasks for retry:
  - BullMQ queue auto-retries every 5 min for up to 2 hours
  - Push notification sent to user when AI service resumes

Step 4: When Gemini restores:
  - Process backlog from BullMQ queue
  - Clear degraded mode flags
  - Notify affected users
```

---

## Backup Strategy

| Data | Frequency | Retention | Method |
|---|---|---|---|
| PostgreSQL | Continuous archiving (WAL) + Daily snapshot | 35 days | RDS automated backups |
| User uploaded files | Real-time replication | 90 days | S3 cross-region replication |
| AI generation logs | Real-time | 365 days | S3 + Glacier transition |
| Audit logs | Real-time / Monthly partition | 7 years (compliance) | Partitioned in PostgreSQL |
| Terraform state | Every apply | 90 days | S3 backend + versioning |

## Recovery Testing Schedule

| Test | Frequency | Duration | Success Criteria |
|---|---|---|---|
| AZ failover | Monthly | 30 min | No user-visible downtime |
| Region failover | Quarterly | 2 hours | Full DR stack operational in < 30 min |
| PITR restore | Quarterly | 1 hour | Data integrity verified |
| AI degradation | Monthly | 15 min | Core flows work without AI |
| k6 load test | Monthly | 30 min | p95 < 800ms at 1,000 concurrent users |

## Monitoring Alarms

| Alarm | Threshold | Action |
|---|---|---|
| `RDS-ReplicaLag` | > 10 seconds | Page on-call |
| `ALB-5xx-Error-Rate` | > 1% for 5 min | Page on-call |
| `ECS-Service-CPU` | > 80% for 10 min | Auto-scale tasks |
| `Redis-CPU` | > 80% for 10 min | Page on-call |
| `Meilisearch-Disk` | > 80% | Auto-scale storage |
| `Gemini-Latency-p95` | > 5 seconds | Trigger degraded mode |
| `Certificate-Expiry` | < 30 days | Email admin |
