#!/usr/bin/env node

const https = require('https');
const url = process.env.HEALTH_URL || 'https://radbitsmehub.co.zw/api/health';
const timeout = parseInt(process.env.TIMEOUT || '10000', 10);

function checkHealth() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = https.get(url, { timeout }, (res) => {
      const duration = Date.now() - start;
      let data = '';

      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({
            status: res.statusCode,
            duration,
            healthy: body.status === 'healthy',
            response: body,
          });
        } catch {
          reject(new Error(`Invalid JSON response: ${data.substring(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeout}ms`));
    });
  });
}

async function main() {
  try {
    const result = await checkHealth();

    if (result.healthy && result.status === 200) {
      console.log(`✅ Health check passed (${result.duration}ms)`);
      console.log(JSON.stringify(result.response, null, 2));
      process.exit(0);
    } else {
      console.error(`⚠️ Health check degraded (status: ${result.status})`);
      console.error(JSON.stringify(result.response, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`);
    process.exit(2);
  }
}

main();
