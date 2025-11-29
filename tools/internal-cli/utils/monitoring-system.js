import { EventEmitter } from 'events';

/**
 * Real-Time Oracle Intelligence Monitoring and Alerting System
 * Enterprise-grade monitoring for the deployment Oracle Intelligence platform
 */
export class OracleIntelligenceMonitoringSystem extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = this.getDefaultThresholds();
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.metricsHistory = [];
    this.maxHistorySize = 1000;

    // Performance monitoring
    this.performanceMetrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageResponseTime: 0,
      oracleResponseTimes: new Map(),
      lastAnalysisTime: null,
    };

    // Health monitoring
    this.healthMetrics = {
      systemStatus: 'healthy',
      lastHealthCheck: Date.now(),
      activeAlerts: 0,
      resolvedAlerts: 0,
      uptime: Date.now(),
    };
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(intervalMs = 5000) {
    if (this.isMonitoring) {
      console.log('📊 Monitoring already active');
      return;
    }

    this.isMonitoring = true;

    console.log(`📊 Starting real-time intelligence monitoring (interval: ${intervalMs}ms)`);

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
      this.collectMetrics();
      this.checkThresholds();
      this.emitMetrics();
    }, intervalMs);

    this.emit('monitoring:started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('📊 Intelligence monitoring stopped');
    this.emit('monitoring:stopped');
  }

  /**
   * Record analysis metrics
   */
  recordAnalysis(analysis, outcome = 'success', details = {}) {
    const timestamp = Date.now();
    const responseTime = analysis.analysisTime || 0;

    // Update performance metrics
    this.performanceMetrics.totalAnalyses++;
    this.performanceMetrics.lastAnalysisTime = timestamp;

    if (outcome === 'success') {
      this.performanceMetrics.successfulAnalyses++;
    } else {
      this.performanceMetrics.failedAnalyses++;
    }

    // Update average response time
    const totalTime =
      this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalAnalyses - 1) +
      responseTime;
    this.performanceMetrics.averageResponseTime = totalTime / this.performanceMetrics.totalAnalyses;

    // Record oracle performance
    if (analysis.oracleResults) {
      analysis.oracleResults.forEach(oracle => {
        const oracleName = oracle.oracle;
        const currentTimes = this.performanceMetrics.oracleResponseTimes.get(oracleName) || [];
        currentTimes.push(responseTime);

        // Keep only last 100 measurements per oracle
        if (currentTimes.length > 100) {
          currentTimes.shift();
        }

        this.performanceMetrics.oracleResponseTimes.set(oracleName, currentTimes);
      });
    }

    // Create analysis record
    const analysisRecord = {
      timestamp,
      packageName: analysis.packageName,
      version: analysis.localVersion,
      outcome,
      responseTime,
      confidence: analysis.consensusScore,
      oracleCount: analysis.oracleResults?.length || 0,
      conflicts: analysis.analysis?.conflicts?.length || 0,
      oracleIntelligenceLevel: analysis.analysis?.oracleIntelligenceLevel || 'unknown',
      details,
    };

    // Add to history
    this.metricsHistory.push(analysisRecord);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Update current metrics
    this.metrics.set('current_analysis', analysisRecord);

    // Emit event for real-time updates
    this.emit('analysis:recorded', analysisRecord);

    // Check for performance alerts
    this.checkPerformanceAlerts(analysisRecord);
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    const currentTime = Date.now();
    const timeSinceLastAnalysis =
      currentTime - (this.performanceMetrics.lastAnalysisTime || currentTime);

    let systemStatus = 'healthy';
    const issues = [];

    // Check if system has been inactive too long
    if (timeSinceLastAnalysis > 300000) {
      // 5 minutes
      systemStatus = 'warning';
      issues.push('System inactive for more than 5 minutes');
    }

    // Check failure rate
    const failureRate =
      this.performanceMetrics.totalAnalyses > 0
        ? this.performanceMetrics.failedAnalyses / this.performanceMetrics.totalAnalyses
        : 0;

    if (failureRate > 0.2) {
      // 20% failure rate
      systemStatus = 'critical';
      issues.push(`High failure rate: ${Math.round(failureRate * 100)}%`);
    }

    // Check average response time
    if (this.performanceMetrics.averageResponseTime > 10000) {
      // 10 seconds
      systemStatus = 'warning';
      issues.push(
        `Slow response time: ${Math.round(this.performanceMetrics.averageResponseTime)}ms`,
      );
    }

    // Update health metrics
    this.healthMetrics = {
      ...this.healthMetrics,
      systemStatus,
      lastHealthCheck: currentTime,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      resolvedAlerts: this.alerts.filter(a => a.resolved).length,
      uptime: currentTime,
    };

    // Emit health status
    this.emit('health:status', {
      status: systemStatus,
      issues,
      metrics: this.healthMetrics,
    });
  }

  /**
   * Collect current metrics
   */
  collectMetrics() {
    const currentMetrics = {
      timestamp: Date.now(),
      performance: { ...this.performanceMetrics },
      health: { ...this.healthMetrics },
      alerts: this.alerts.filter(a => !a.resolved),
      recentAnalyses: this.metricsHistory.slice(-10),
    };

    this.metrics.set('current_metrics', currentMetrics);
    return currentMetrics;
  }

  /**
   * Check thresholds and generate alerts
   */
  checkThresholds() {
    const metrics = this.collectMetrics();

    // Performance threshold checks
    if (metrics.performance.averageResponseTime > this.thresholds.maxResponseTime) {
      this.createAlert(
        'performance',
        'high',
        `Average response time exceeded threshold: ${Math.round(metrics.performance.averageResponseTime)}ms`,
      );
    }

    // Success rate threshold checks
    const successRate =
      metrics.performance.totalAnalyses > 0
        ? metrics.performance.successfulAnalyses / metrics.performance.totalAnalyses
        : 1;

    if (successRate < this.thresholds.minSuccessRate) {
      this.createAlert(
        'reliability',
        'critical',
        `Success rate below threshold: ${Math.round(successRate * 100)}%`,
      );
    }

    // Oracle coverage threshold checks
    const avgOracleCount =
      this.metricsHistory.length > 0
        ? this.metricsHistory.reduce((sum, a) => sum + a.oracleCount, 0) /
          this.metricsHistory.length
        : 0;

    if (avgOracleCount < this.thresholds.minOracleCount) {
      this.createAlert(
        'oracle',
        'warning',
        `Average oracle coverage below threshold: ${Math.round(avgOracleCount)}/6`,
      );
    }

    // Inactivity alert
    const timeSinceLastAnalysis = Date.now() - (metrics.performance.lastAnalysisTime || Date.now());
    if (timeSinceLastAnalysis > this.thresholds.maxInactivityTime) {
      this.createAlert(
        'system',
        'warning',
        `System inactive for ${Math.round(timeSinceLastAnalysis / 60000)} minutes`,
      );
    }
  }

  /**
   * Create and manage alerts
   */
  createAlert(type, severity, message, metadata = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity, // 'info', 'warning', 'critical'
      message,
      timestamp: Date.now(),
      resolved: false,
      resolvedAt: null,
      metadata,
    };

    this.alerts.push(alert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    // Emit alert event
    this.emit('alert:created', alert);

    // Log alert
    this.logAlert(alert);

    return alert;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId, resolution = '') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = Date.now();
    alert.resolution = resolution;

    this.emit('alert:resolved', alert);
    return true;
  }

  /**
   * Emit metrics for real-time consumers
   */
  emitMetrics() {
    const metrics = this.collectMetrics();
    this.emit('metrics:update', metrics);
  }

  /**
   * Get current dashboard data
   */
  getDashboardData() {
    const metrics = this.collectMetrics();
    const recentPerformance = this.getRecentPerformance();
    const oracleHealth = this.getOracleHealth();
    const activeAlerts = this.getActiveAlerts();

    return {
      metrics,
      recentPerformance,
      oracleHealth,
      activeAlerts,
      uptime: this.calculateUptime(),
    };
  }

  /**
   * Get recent performance statistics
   */
  getRecentPerformance(timeWindowMs = 300000) {
    // 5 minutes
    const cutoffTime = Date.now() - timeWindowMs;
    const recentAnalyses = this.metricsHistory.filter(a => a.timestamp > cutoffTime);

    if (recentAnalyses.length === 0) {
      return {
        count: 0,
        successRate: 1,
        averageResponseTime: 0,
        averageConfidence: 0,
        averageOracleCount: 0,
      };
    }

    const successRate =
      recentAnalyses.filter(a => a.outcome === 'success').length / recentAnalyses.length;
    const averageResponseTime =
      recentAnalyses.reduce((sum, a) => sum + a.responseTime, 0) / recentAnalyses.length;
    const averageConfidence =
      recentAnalyses.reduce((sum, a) => sum + a.confidence, 0) / recentAnalyses.length;
    const averageOracleCount =
      recentAnalyses.reduce((sum, a) => sum + a.oracleCount, 0) / recentAnalyses.length;

    return {
      count: recentAnalyses.length,
      successRate,
      averageResponseTime,
      averageConfidence,
      averageOracleCount,
    };
  }

  /**
   * Get oracle health status
   */
  getOracleHealth() {
    const oracleHealth = new Map();

    this.performanceMetrics.oracleResponseTimes.forEach((times, oracleName) => {
      if (times.length === 0) {
        oracleHealth.set(oracleName, {
          status: 'unknown',
          averageResponseTime: 0,
          lastResponse: null,
          reliability: 0,
        });
        return;
      }

      const averageResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const lastResponse = Math.max(...times);

      // Determine reliability based on response time consistency
      const variance = this.calculateVariance(times);
      const reliability = Math.max(0, 1 - variance / (averageResponseTime * averageResponseTime));

      let status = 'healthy';
      if (averageResponseTime > 5000) status = 'warning';
      if (averageResponseTime > 10000) status = 'critical';
      if (Date.now() - lastResponse > 60000) status = 'inactive';

      oracleHealth.set(oracleName, {
        status,
        averageResponseTime,
        lastResponse,
        reliability,
      });
    });

    return oracleHealth;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts
      .filter(a => !a.resolved)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50); // Return last 50 active alerts
  }

  /**
   * Calculate system uptime
   */
  calculateUptime() {
    const uptime = Date.now() - this.healthMetrics.uptime;
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));

    return { days, hours, minutes, uptime };
  }

  /**
   * Export metrics for external systems
   */
  exportMetrics(format = 'json') {
    const dashboardData = this.getDashboardData();

    if (format === 'json') {
      return JSON.stringify(dashboardData, null, 2);
    } else if (format === 'prometheus') {
      return this.exportPrometheusMetrics(dashboardData);
    } else if (format === 'csv') {
      return this.exportCSVMetrics(dashboardData);
    }

    return dashboardData;
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics(data) {
    const metrics = [];

    // Performance metrics
    metrics.push(
      `deployment_intelligence_total_analyses ${data.metrics.performance.totalAnalyses}`,
    );
    metrics.push(`deployment_intelligence_success_rate ${data.recentPerformance.successRate}`);
    metrics.push(
      `deployment_intelligence_average_response_time_ms ${data.recentPerformance.averageResponseTime}`,
    );
    metrics.push(
      `deployment_intelligence_average_confidence ${data.recentPerformance.averageConfidence}`,
    );

    // Oracle metrics
    data.oracleHealth.forEach((health, oracle) => {
      metrics.push(
        `deployment_intelligence_oracle_response_time_ms{oracle="${oracle}"} ${health.averageResponseTime}`,
      );
      metrics.push(
        `deployment_intelligence_oracle_reliability{oracle="${oracle}"} ${health.reliability}`,
      );
    });

    return metrics.join('\n');
  }

  /**
   * Check for performance-related alerts
   */
  checkPerformanceAlerts(analysisRecord) {
    // Slow analysis alert
    if (analysisRecord.responseTime > 5000) {
      this.createAlert(
        'performance',
        'warning',
        `Slow analysis detected: ${analysisRecord.responseTime}ms for ${analysisRecord.packageName}`,
        {
          packageName: analysisRecord.packageName,
          responseTime: analysisRecord.responseTime,
        },
      );
    }

    // Low confidence alert
    if (analysisRecord.confidence < 0.6) {
      this.createAlert(
        'intelligence',
        'warning',
        `Low intelligence confidence: ${Math.round(analysisRecord.confidence * 100)}% for ${analysisRecord.packageName}`,
        {
          packageName: analysisRecord.packageName,
          confidence: analysisRecord.confidence,
        },
      );
    }

    // Oracle coverage alert
    if (analysisRecord.oracleCount < 4) {
      this.createAlert(
        'oracle',
        'warning',
        `Insufficient oracle coverage: ${analysisRecord.oracleCount}/6 for ${analysisRecord.packageName}`,
        {
          packageName: analysisRecord.packageName,
          oracleCount: analysisRecord.oracleCount,
        },
      );
    }
  }

  /**
   * Log alert to console and file
   */
  logAlert(alert) {
    const timestamp = new Date(alert.timestamp).toISOString();
    const severityIcon =
      {
        info: '💡',
        warning: '⚠️',
        critical: '🚨',
      }[alert.severity] || '📋';

    const logMessage = `${timestamp} ${severityIcon} [${alert.type.toUpperCase()}] ${alert.message}`;

    console.log(
      alert.severity === 'critical'
        ? this.colorRed(logMessage)
        : alert.severity === 'warning'
          ? this.colorYellow(logMessage)
          : this.colorBlue(logMessage),
    );

    // Could also log to file here
    // this.logToFile(logMessage);
  }

  /**
   * Get default monitoring thresholds
   */
  getDefaultThresholds() {
    return {
      maxResponseTime: 5000, // 5 seconds
      minSuccessRate: 0.9, // 90%
      minOracleCount: 4, // 4 out of 6 oracles
      maxInactivityTime: 300000, // 5 minutes
      maxFailureRate: 0.1, // 10%
    };
  }

  /**
   * Calculate variance of response times
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Color utilities for console output
  colorRed(text) {
    return `\x1b[31m${text}\x1b[0m`;
  }
  colorYellow(text) {
    return `\x1b[33m${text}\x1b[0m`;
  }
  colorBlue(text) {
    return `\x1b[34m${text}\x1b[0m`;
  }
  colorGreen(text) {
    return `\x1b[32m${text}\x1b[0m`;
  }
}
