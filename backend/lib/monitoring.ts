/**
 * tRPC Procedure Monitoring
 *
 * Tracks per-procedure request counts, error rates, and latency.
 * Exposes Prometheus-compatible metrics via getPrometheusMetrics().
 */

interface ProcedureStats {
  requestCount: number;
  errorCount: number;
  totalLatencyMs: number;
  lastRequestAt: number;
}

const procedureMetrics = new Map<string, ProcedureStats>();

export function recordRequest(path: string, latencyMs: number, isError: boolean): void {
  const existing = procedureMetrics.get(path);

  if (existing) {
    existing.requestCount++;
    if (isError) existing.errorCount++;
    existing.totalLatencyMs += latencyMs;
    existing.lastRequestAt = Date.now();
  } else {
    procedureMetrics.set(path, {
      requestCount: 1,
      errorCount: isError ? 1 : 0,
      totalLatencyMs: latencyMs,
      lastRequestAt: Date.now(),
    });
  }
}

export function getPrometheusMetrics(): string {
  if (procedureMetrics.size === 0) return '';

  const lines: string[] = [];

  // Request counts
  lines.push('# HELP trpc_requests_total Total tRPC requests by procedure');
  lines.push('# TYPE trpc_requests_total counter');
  for (const [path, stats] of procedureMetrics) {
    lines.push(`trpc_requests_total{procedure="${path}"} ${stats.requestCount}`);
  }

  // Error counts
  lines.push('');
  lines.push('# HELP trpc_errors_total Total tRPC errors by procedure');
  lines.push('# TYPE trpc_errors_total counter');
  for (const [path, stats] of procedureMetrics) {
    lines.push(`trpc_errors_total{procedure="${path}"} ${stats.errorCount}`);
  }

  // Average latency
  lines.push('');
  lines.push('# HELP trpc_latency_avg_ms Average tRPC latency in milliseconds');
  lines.push('# TYPE trpc_latency_avg_ms gauge');
  for (const [path, stats] of procedureMetrics) {
    const avg = stats.requestCount > 0 ? Math.round(stats.totalLatencyMs / stats.requestCount) : 0;
    lines.push(`trpc_latency_avg_ms{procedure="${path}"} ${avg}`);
  }

  return lines.join('\n');
}

export function resetMetrics(): void {
  procedureMetrics.clear();
}
