# Threat Model — Radbit SME Hub (STRIDE Methodology)

## Assets

| Asset | Classification | Owner |
|---|---|---|
| User PII (phone, email, ID numbers) | Restricted | Users |
| Business registration documents | Restricted | Businesses |
| Payment tokens | Critical | Payment processor |
| AI generation history | Internal | Users |
| Tender application data | Internal | Users + Government |
| Platform credentials (API keys) | Critical | Engineering |
| Session tokens | Internal | Auth service |

## Threat Analysis

### Spoofing

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Phone number spoofing to receive OTP | High | Medium | Rate limit OTP requests. Verify phone via network operator where possible. |
| JWT forgery | Critical | Low | RS256 signing with rotated keys. Short TTL (15 min). |
| API key theft | Critical | Low | KMS for secrets. Restrict by IP + VPC. Rotate every 90 days. |

### Tampering

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Modify AI generation outputs in-flight | Medium | Low | TLS 1.3 + signed responses. |
| Modify subscription tier in DB | Critical | Low | RLS policies. Audit log for all subscription changes. |
| Modify tender application after submission | High | Low | Status transitions enforced at DB level. Immutable audit log. |
| Webhook payload spoofing | High | Medium | Signature verification for all provider webhooks. Idempotency keys. |

### Repudiation

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| User claims they didn't submit a tender | Medium | Low | Audit log captures who, when, what for all tender applications. |
| User claims AI generated inappropriate content | Medium | Low | Log prompts + outputs. Allow users to report. |
| Denial of payment | High | Low | Blockchain-style ledger for all transactions. Immutable invoices. |

### Information Disclosure

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| PII exposure via API | Critical | Medium | RLS + field-level encryption. PII masked in logs. |
| Tender details leaked between users | High | Medium | RLS ensures users see only own applications. Tenders are public. |
| AI prompts visible to other users | Medium | Low | Each user sees own history only. RLS on ai_generations. |
| Payment method details leaked | Critical | Low | Never store card numbers. Tokenization only. |

### Denial of Service

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| AI endpoint flooded → cost spike | High | Medium | Token budgeting per user. Hard cap. Request queue (BullMQ). |
| Phone OTP SMS bombing | Medium | High | Rate limit OTP requests to 3/hour per phone. CAPTCHA after 3. |
| API DDoS | High | Medium | Cloudflare DDoS protection. API Gateway rate limiting (100 req/min/user). |

### Elevation of Privilege

| Threat | Impact | Likelihood | Mitigation |
|---|---|---|---|
| User upgrades own subscription without payment | Critical | Low | Subscription changes go through Payment Orchestrator only. Never direct DB update. |
| Staff user accesses admin functions | High | Low | RBAC enforced at API Gateway. JWT claims validated per request. |
| User accesses another user's data via IDOR | High | Medium | RLS on all tables. UUIDs (not sequential) for all entities. |
| User role escalation via API | Critical | Low | Role is JWT claim signed by server. Cannot be modified client-side. |

## Incident Response Runbook

### Data Breach

```
DETECTION:
- SIEM alert: unusual query pattern from single user
- DLP alert: large number of records exported
- User report: unauthorized access

IMMEDIATE (First 15 min):
1. [P0] Isolate affected systems:
   - Revoke all active sessions
   - Rotate affected API keys
   - Block affected user accounts
2. [P1] Engage incident response team
3. [P1] Preserve logs and snapshots

INVESTIGATION (15 min - 2 hours):
4. [P2] Determine scope:
   - Which users affected?
   - What data was accessed?
   - What was the entry point?
5. [P2] Review audit logs for affected time range
6. [P2] Check SIEM for related events

CONTAINMENT (2-4 hours):
7. [P1] Patch vulnerability
8. [P2] Force password reset for affected users
9. [P2] Deploy WAF rule if applicable

NOTIFICATION (Within 72 hours per Zim Cyber Act):
10. [P1] Notify affected users via WhatsApp + Email
11. [P1] Notify PIMFA (Zim Data Protection Authority)
12. [P1] Prepare public statement if media involvement likely

RECOVERY:
13. [P2] Restore from clean backup (pre-breach)
14. [P2] Verify no backdoors remain
15. [P3] Conduct post-mortem and update runbook

COMMUNICATION:
- Internal: #security Slack channel → hourly updates
- External: Single designated spokesperson only
- Legal: Engage external counsel for Zim/SADC regulatory requirements
```

### Ransomware

```
1. Immediate isolation: Disconnect affected servers from network
2. Do NOT pay ransom
3. Restore from last clean backup (RPO < 5 min)
4. Determine entry vector:
   - Phishing? → Email security review
   - Exposed RDP? → VPN-only access
   - Vulnerable package? → Patch + Dependabot alert
5. Report to ZIMRA Cyber Unit
```

### DDoS Attack

```
1. Cloudflare DDoS mitigation engages automatically
2. If Cloudflare overwhelmed:
   - Enable "Under Attack" mode in Cloudflare dashboard
   - Increase challenge difficulty
3. Rate limiting:
   - Stricter limits per IP
   - Challenge for sensitive endpoints
4. Monitor during attack:
   - Alert if p95 latency > 2s for > 5 min
   - Auto-scale ECS if CPU > 80%
5. Post-attack: Update WAF rules based on attack patterns
```

## Compliance Checklist

| Requirement | Zim Cyber Act | POPIA (SA) | GDPR | Status |
|---|---|---|---|---|
| Data Processing Register | §15 | §15 | Art 30 | ✅ |
| Consent Management | §16 | §11 | Art 7 | ✅ |
| Purpose Limitation | §17 | §13 | Art 5 | ✅ |
| Data Minimization | §18 | §10 | Art 5 | ✅ |
| Retention Limitation | §19 | §14 | Art 5 | ✅ |
| Security Measures | §20 | §19 | Art 32 | ✅ |
| Breach Notification | §21 | §22 | Art 33 | ✅ (72h) |
| Deletion/Anonymization | §22 | §24 | Art 17 | ✅ (stored proc) |
| Cross-border Transfer | §23 | §72 | Art 44 | ✅ (SA primary, EU DR) |
| Data Protection Officer | §24 | §55 | Art 37 | ✅ |
| Privacy Impact Assessment | — | §17 | Art 35 | ✅ |
| Cookie Consent | — | — | ePrivacy | ✅ |
| Right to Object | §25 | §13 | Art 21 | ✅ |
| Automated Decision Notification | §26 | §71 | Art 22 | ✅ (AI disclosures) |
