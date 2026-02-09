/**
 * Health Check Module
 *
 * Provides health check endpoints for production monitoring
 * Compatible with Kubernetes, Docker, and load balancers
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { getPrometheusMetrics } from '../lib/monitoring.js';

// ============================================
// Types
// ============================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, CheckResult>;
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
  lastCheck?: string;
}

export interface ReadinessStatus {
  ready: boolean;
  checks: Record<string, boolean>;
}

// ============================================
// Health Check Functions
// ============================================

const startTime = Date.now();

/**
 * Check database connectivity via real Supabase query
 */
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !key) {
      return {
        status: 'fail',
        message: 'Supabase config missing',
        duration: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    const client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Real DB ping: select 1 row from users (lightweight)
    const { error } = await client
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return {
        status: 'fail',
        message: `DB query failed: ${error.code}`,
        duration: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    return {
      status: 'pass',
      message: 'Database connection OK',
      duration: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Database check failed',
      duration: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check external API connectivity (OpenAI, FAL.ai)
 */
async function checkExternalAPIs(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const missing: string[] = [];
    if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
    if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!process.env.FAL_KEY) missing.push('FAL_KEY');

    if (missing.length > 0) {
      return {
        status:
          missing.includes('OPENAI_API_KEY') || missing.includes('SUPABASE_URL') ? 'fail' : 'warn',
        message: `Missing keys: ${missing.join(', ')}`,
        duration: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    // Real OpenAI connectivity check (lightweight models endpoint)
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!openaiResponse.ok) {
      return {
        status: 'warn',
        message: `OpenAI API returned ${openaiResponse.status}`,
        duration: Date.now() - start,
        lastCheck: new Date().toISOString(),
      };
    }

    return {
      status: 'pass',
      message: 'All external APIs reachable',
      duration: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'warn',
      message: error instanceof Error ? error.message : 'API check failed',
      duration: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): CheckResult {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const usagePercent = (used.heapUsed / used.heapTotal) * 100;

  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (usagePercent > 90) {
    status = 'fail';
  } else if (usagePercent > 70) {
    status = 'warn';
  }

  return {
    status,
    message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
    lastCheck: new Date().toISOString(),
  };
}

// ============================================
// Health Check Router
// ============================================

export const healthRouter = new Hono();

/**
 * Liveness probe - Is the process running?
 * Used by Kubernetes/Docker to determine if the container should be restarted
 */
healthRouter.get('/live', c => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness probe - Is the service ready to accept traffic?
 * Used by load balancers to determine if the instance should receive requests
 */
healthRouter.get('/ready', async c => {
  const dbCheck = await checkDatabase();
  const apiCheck = await checkExternalAPIs();

  const ready = dbCheck.status !== 'fail' && apiCheck.status !== 'fail';

  const response: ReadinessStatus = {
    ready,
    checks: {
      database: dbCheck.status !== 'fail',
      externalAPIs: apiCheck.status !== 'fail',
    },
  };

  return c.json(response, ready ? 200 : 503);
});

/**
 * Full health check - Detailed status of all components
 * Used for monitoring dashboards and debugging
 */
healthRouter.get('/health', async c => {
  const [dbCheck, apiCheck] = await Promise.all([checkDatabase(), checkExternalAPIs()]);
  const memoryCheck = checkMemory();

  const checks = {
    database: dbCheck,
    externalAPIs: apiCheck,
    memory: memoryCheck,
  };

  // Determine overall status
  const hasFailure = Object.values(checks).some(check => check.status === 'fail');
  const hasWarning = Object.values(checks).some(check => check.status === 'warn');

  let overallStatus: HealthStatus['status'] = 'healthy';
  if (hasFailure) {
    overallStatus = 'unhealthy';
  } else if (hasWarning) {
    overallStatus = 'degraded';
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  return c.json(response, statusCode);
});

/**
 * Metrics endpoint - Prometheus-compatible metrics
 */
healthRouter.get('/metrics', c => {
  const uptime = Math.round((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  const procedureMetrics = getPrometheusMetrics();

  const metrics = [
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${uptime}`,
    '',
    `# HELP process_heap_bytes Process heap size in bytes`,
    `# TYPE process_heap_bytes gauge`,
    `process_heap_bytes{type="used"} ${memory.heapUsed}`,
    `process_heap_bytes{type="total"} ${memory.heapTotal}`,
    '',
    `# HELP process_rss_bytes Process RSS in bytes`,
    `# TYPE process_rss_bytes gauge`,
    `process_rss_bytes ${memory.rss}`,
    '',
    `# HELP nodejs_version Node.js version`,
    `# TYPE nodejs_version gauge`,
    `nodejs_version{version="${process.version}"} 1`,
    ...(procedureMetrics ? ['', procedureMetrics] : []),
  ].join('\n');

  return c.text(metrics, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
});

/**
 * Version endpoint
 */
healthRouter.get('/version', c => {
  return c.json({
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});
