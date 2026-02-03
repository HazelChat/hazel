# OpenTelemetry Platform Architecture Plan

## Executive Summary

This document outlines the architecture and implementation plan for building a production-grade observability platform using the OpenTelemetry Collector and ClickHouse as the storage backend.

**Key Insights from HyperDX/ClickStack**: This plan incorporates learnings from HyperDX, the open-source observability UI that powers ClickStack. Key takeaways include schema-agnostic design, dynamic collector configuration via OpAMP, materialized columns for Kubernetes metadata, and a unified search experience supporting both Lucene-style and SQL queries.

---

## Part 1: Understanding the OpenTelemetry Collector

### Core Architecture

The OpenTelemetry Collector is a vendor-agnostic binary that receives, processes, and exports telemetry data (traces, metrics, logs). It uses a **pipeline-based architecture** with five component types:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OpenTelemetry Collector                          │
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │Receivers │───▶│Processors│───▶│Exporters │───▶│ Backend  │      │
│  │          │    │          │    │          │    │(ClickHouse)│     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │                                                             │
│       │         ┌──────────┐                                        │
│       └────────▶│Connectors│──────▶ (to other pipelines)            │
│                 └──────────┘                                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Extensions: health_check, pprof, zpages, authenticators      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Deep Dive

#### 1. Receivers
- **Purpose**: Accept telemetry data from various sources
- **Modes**: Pull (scraping) or Push (listening on ports)
- **Key Receivers**:
  - `otlp`: OTLP gRPC (4317) and HTTP (4318) - primary receiver
  - `filelog`: Tail log files from disk
  - `prometheus`: Scrape Prometheus metrics endpoints
  - `jaeger`, `zipkin`: Legacy trace formats
  - `hostmetrics`: System-level metrics

#### 2. Processors
- **Purpose**: Transform, filter, enrich, sample data
- **Execution**: Sequential within a pipeline
- **Key Processors**:
  - `batch`: Batches data for efficient export (critical for ClickHouse)
  - `memory_limiter`: Prevents OOM by applying backpressure
  - `attributes`: Add/remove/modify attributes
  - `filter`: Drop unwanted telemetry
  - `transform`: OTTL-based transformations
  - `tail_sampling`: Intelligent trace sampling
  - `resourcedetection`: Auto-detect cloud/k8s metadata

#### 3. Exporters
- **Purpose**: Send data to backends
- **Key Exporters**:
  - `clickhouse`: Direct to ClickHouse (our choice)
  - `otlp`: Forward to another collector
  - `debug`: Console output for troubleshooting
  - `loadbalancing`: Distribute across multiple backends

#### 4. Connectors
- **Purpose**: Bridge pipelines, enable derived signals
- **Use Cases**:
  - Generate metrics from traces (RED metrics)
  - Route data between signal types
  - Implement complex processing workflows

#### 5. Extensions
- **Purpose**: Add capabilities beyond data processing
- **Key Extensions**:
  - `health_check`: Liveness/readiness endpoints
  - `pprof`: Go profiling
  - `zpages`: Live debugging UI (port 55679)
  - `basicauth`: Authentication

### Data Flow

```
                    ┌─────────────────────────────────────┐
                    │           PIPELINE                  │
                    │                                     │
Receiver A ────┐    │  ┌───────┐   ┌───────┐   ┌───────┐ │    ┌──────────┐
               ├───▶│  │Proc 1 │──▶│Proc 2 │──▶│Proc N │─┼───▶│Exporter A│
Receiver B ────┘    │  └───────┘   └───────┘   └───────┘ │    └──────────┘
                    │                                     │    ┌──────────┐
                    │              (fan-out to all) ──────┼───▶│Exporter B│
                    │                                     │    └──────────┘
                    └─────────────────────────────────────┘
```

**Key Rules**:
1. Multiple receivers can feed one pipeline
2. Processors execute sequentially
3. Data fans out to ALL exporters (each gets a copy)
4. Components must be listed in `service` section to be active

---

## Part 2: ClickHouse as Observability Backend

### Why ClickHouse?

1. **Columnar Storage**: 10-30x compression on observability data
2. **High-Cardinality Handling**: Purpose-built for dimensional data
3. **SQL Interface**: Familiar query language
4. **Sub-second Queries**: Aggregation-heavy workloads
5. **Horizontal Scaling**: Linear performance scaling
6. **Cost Efficient**: Compression + tiered storage

### Performance Benchmarks

- Single 32-core/128GB node: ~20TB (20B logs) daily
- Collector throughput: ~40k logs/second per CPU core
- Compression ratios: 7-11x typical, up to 26x for attributes

### Default Schema (OTel Exporter)

#### Logs Table (`otel_logs`)
```sql
CREATE TABLE otel_logs (
    Timestamp DateTime64(9) CODEC(Delta, ZSTD(1)),
    TraceId String CODEC(ZSTD(1)),
    SpanId String CODEC(ZSTD(1)),
    TraceFlags UInt8,
    SeverityText LowCardinality(String) CODEC(ZSTD(1)),
    SeverityNumber UInt8,
    ServiceName LowCardinality(String) CODEC(ZSTD(1)),
    Body String CODEC(ZSTD(1)),
    ResourceAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    ScopeAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    LogAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),

    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(10240, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, Timestamp, TraceId)
TTL toDateTime(Timestamp) + INTERVAL 30 DAY;
```

#### Traces Table (`otel_traces`)
```sql
CREATE TABLE otel_traces (
    Timestamp DateTime64(9) CODEC(Delta, ZSTD(1)),
    TraceId String CODEC(ZSTD(1)),
    SpanId String CODEC(ZSTD(1)),
    ParentSpanId String CODEC(ZSTD(1)),
    TraceState String CODEC(ZSTD(1)),
    SpanName LowCardinality(String) CODEC(ZSTD(1)),
    SpanKind LowCardinality(String) CODEC(ZSTD(1)),
    ServiceName LowCardinality(String) CODEC(ZSTD(1)),
    Duration Int64 CODEC(ZSTD(1)),
    StatusCode LowCardinality(String) CODEC(ZSTD(1)),
    StatusMessage String CODEC(ZSTD(1)),
    ResourceAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    SpanAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    Events Nested (
        Timestamp DateTime64(9),
        Name LowCardinality(String),
        Attributes Map(LowCardinality(String), String)
    ) CODEC(ZSTD(1)),
    Links Nested (
        TraceId String,
        SpanId String,
        TraceState String,
        Attributes Map(LowCardinality(String), String)
    ) CODEC(ZSTD(1)),

    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + INTERVAL 30 DAY;
```

#### Metrics Tables
Separate tables per metric type for optimal storage:
- `otel_metrics_gauge` - Point-in-time values
- `otel_metrics_sum` - Cumulative counters
- `otel_metrics_histogram` - Distribution data
- `otel_metrics_summary` - Pre-calculated quantiles
- `otel_metrics_exp_histogram` - Exponential histograms

---

## Part 3: Platform Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATIONS                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ Service │ │ Service │ │ Service │ │ Service │ │ Service │               │
│  │   A     │ │   B     │ │   C     │ │   D     │ │   E     │               │
│  │(OTel SDK)│ │(OTel SDK)│ │(OTel SDK)│ │(OTel SDK)│ │(OTel SDK)│           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘               │
└───────┼──────────┼──────────┼──────────┼──────────┼──────────────────────────┘
        │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COLLECTION TIER (Agents)                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐             │
│  │  OTel Collector  │ │  OTel Collector  │ │  OTel Collector  │             │
│  │     (Agent)      │ │     (Agent)      │ │     (Agent)      │             │
│  │  - OTLP Receiver │ │  - OTLP Receiver │ │  - OTLP Receiver │             │
│  │  - Filelog       │ │  - Filelog       │ │  - Filelog       │             │
│  │  - Host Metrics  │ │  - Host Metrics  │ │  - Host Metrics  │             │
│  │  - Memory Limiter│ │  - Memory Limiter│ │  - Memory Limiter│             │
│  │  - OTLP Exporter │ │  - OTLP Exporter │ │  - OTLP Exporter │             │
│  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘             │
└───────────┼────────────────────┼────────────────────┼────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AGGREGATION TIER (Gateway)                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Load Balancer (L4/L7)                                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                    │                    │                    │               │
│                    ▼                    ▼                    ▼               │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐             │
│  │  OTel Collector  │ │  OTel Collector  │ │  OTel Collector  │             │
│  │    (Gateway)     │ │    (Gateway)     │ │    (Gateway)     │             │
│  │  - OTLP Receiver │ │  - OTLP Receiver │ │  - OTLP Receiver │             │
│  │  - Batch (5000)  │ │  - Batch (5000)  │ │  - Batch (5000)  │             │
│  │  - Sampling      │ │  - Sampling      │ │  - Sampling      │             │
│  │  - Transform     │ │  - Transform     │ │  - Transform     │             │
│  │  - ClickHouse Exp│ │  - ClickHouse Exp│ │  - ClickHouse Exp│             │
│  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘             │
└───────────┼────────────────────┼────────────────────┼────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STORAGE TIER                                         │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       ClickHouse Cluster                                │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    ClickHouse Keeper                              │  │ │
│  │  │              (Coordination / Consensus)                           │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │  Shard 1    │  │  Shard 2    │  │  Shard 3    │  │  Shard N    │   │ │
│  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │   │ │
│  │  │  │Replica│  │  │  │Replica│  │  │  │Replica│  │  │  │Replica│  │   │ │
│  │  │  │   1   │  │  │  │   1   │  │  │  │   1   │  │  │  │   1   │  │   │ │
│  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │   │ │
│  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │   │ │
│  │  │  │Replica│  │  │  │Replica│  │  │  │Replica│  │  │  │Replica│  │   │ │
│  │  │  │   2   │  │  │  │   2   │  │  │  │   2   │  │  │  │   2   │  │   │ │
│  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     Object Storage (S3/GCS)                             │ │
│  │                    (Cold Tier - Optional)                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUERY TIER                                          │
│                                                                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐             │
│  │     Grafana      │ │   Custom API     │ │   Alert Manager  │             │
│  │  (Visualization) │ │    (Query)       │ │   (Alerting)     │             │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Deployment Patterns

#### Pattern 1: Simple (< 100 services)
```
Apps → OTel Agent → ClickHouse (single node)
```

#### Pattern 2: Medium (100-500 services)
```
Apps → OTel Agents → OTel Gateway (3 nodes) → ClickHouse Cluster (3 shards)
```

#### Pattern 3: Large (500+ services)
```
Apps → OTel Agents → Kafka → OTel Gateways → ClickHouse Cluster (N shards)
```

---

## Part 4: Implementation Plan

### Phase 1: Foundation (Week 1-2)

#### 1.1 Infrastructure Setup
- [ ] Set up ClickHouse cluster (minimum 3 nodes for HA)
- [ ] Configure ClickHouse Keeper for coordination
- [ ] Create databases and optimized schemas
- [ ] Set up replication and sharding strategy

#### 1.2 Schema Design
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS otel ON CLUSTER '{cluster}';

-- Optimized logs table with custom ORDER BY
CREATE TABLE otel.logs ON CLUSTER '{cluster}' (
    Timestamp DateTime64(9) CODEC(Delta, ZSTD(1)),
    TimestampDate Date DEFAULT toDate(Timestamp),
    TraceId String CODEC(ZSTD(1)),
    SpanId String CODEC(ZSTD(1)),
    TraceFlags UInt8,
    SeverityText LowCardinality(String) CODEC(ZSTD(1)),
    SeverityNumber UInt8,
    ServiceName LowCardinality(String) CODEC(ZSTD(1)),
    ResourceSchemaUrl LowCardinality(String) CODEC(ZSTD(1)),
    ScopeName String CODEC(ZSTD(1)),
    ScopeVersion LowCardinality(String) CODEC(ZSTD(1)),
    ScopeSchemaUrl LowCardinality(String) CODEC(ZSTD(1)),
    Body String CODEC(ZSTD(1)),
    ResourceAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    ScopeAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    LogAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),

    -- Materialized columns for frequently queried attributes
    Environment LowCardinality(String)
        MATERIALIZED ResourceAttributes['deployment.environment'] CODEC(ZSTD(1)),
    PodName LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.pod.name'] CODEC(ZSTD(1)),

    -- Indexes
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1,
    INDEX idx_severity SeverityText TYPE set(100) GRANULARITY 4
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/otel_logs', '{replica}')
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp64Nano(Timestamp))
TTL TimestampDate + INTERVAL 30 DAY DELETE
SETTINGS index_granularity = 8192;

-- Distributed table for queries
CREATE TABLE otel.logs_distributed ON CLUSTER '{cluster}'
AS otel.logs
ENGINE = Distributed('{cluster}', otel, logs, rand());
```

#### 1.3 Collector Configuration

**Agent Configuration** (`agent-config.yaml`):
```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

  filelog:
    include:
      - /var/log/**/*.log
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+)\s+(?P<level>\S+)\s+(?P<message>.*)$'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%Y-%m-%dT%H:%M:%S.%LZ'

  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
      memory:
      disk:
      network:

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128

  batch:
    send_batch_size: 1000
    timeout: 5s

  resourcedetection:
    detectors: [env, system, docker, gcp, aws, azure]
    timeout: 5s

  attributes:
    actions:
      - key: collector.type
        value: agent
        action: insert

exporters:
  otlp:
    endpoint: gateway.otel.svc:4317
    tls:
      insecure: true

  debug:
    verbosity: basic

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, resourcedetection, attributes]
      exporters: [otlp]
    metrics:
      receivers: [otlp, hostmetrics]
      processors: [memory_limiter, batch, resourcedetection, attributes]
      exporters: [otlp]
    logs:
      receivers: [otlp, filelog]
      processors: [memory_limiter, batch, resourcedetection, attributes]
      exporters: [otlp]
  telemetry:
    logs:
      level: info
    metrics:
      address: 0.0.0.0:8888
```

**Gateway Configuration** (`gateway-config.yaml`):
```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        max_recv_msg_size_mib: 16
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 4096
    spike_limit_mib: 1024

  batch:
    send_batch_size: 5000
    send_batch_max_size: 10000
    timeout: 5s

  # Tail-based sampling for traces
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    expected_new_traces_per_sec: 10000
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow-traces
        type: latency
        latency: {threshold_ms: 1000}
      - name: probabilistic
        type: probabilistic
        probabilistic: {sampling_percentage: 10}

  # Transform processor for enrichment
  transform:
    log_statements:
      - context: log
        statements:
          - set(severity_number, 17) where severity_text == "ERROR"
          - set(attributes["processed_by"], "gateway")
    trace_statements:
      - context: span
        statements:
          - set(attributes["processed_by"], "gateway")

exporters:
  clickhouse:
    endpoint: tcp://clickhouse-cluster:9000?dial_timeout=10s&compress=lz4
    database: otel
    username: ${env:CLICKHOUSE_USER}
    password: ${env:CLICKHOUSE_PASSWORD}
    ttl: 720h  # 30 days
    logs_table_name: logs
    traces_table_name: traces
    create_schema: false  # Manage schema separately
    timeout: 10s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 5000
    async_insert: true
    cluster_name: otel_cluster

  # Debug exporter for troubleshooting
  debug:
    verbosity: detailed
    sampling_initial: 5
    sampling_thereafter: 200

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, tail_sampling, batch, transform]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch, transform]
      exporters: [clickhouse]
  telemetry:
    logs:
      level: info
    metrics:
      address: 0.0.0.0:8888
```

### Phase 2: Core Platform Components (Week 3-4)

#### 2.1 Query Service API

Build a REST/gRPC API layer for querying telemetry data:

```
/api/v1/
├── logs/
│   ├── search          # Full-text log search
│   ├── aggregate       # Aggregation queries
│   └── tail            # Live log tailing
├── traces/
│   ├── search          # Find traces by attributes
│   ├── get/{traceId}   # Get full trace
│   └── services        # List services
├── metrics/
│   ├── query           # PromQL-compatible queries
│   ├── labels          # List available labels
│   └── series          # List time series
└── health/
    └── status          # System health
```

#### 2.2 Essential Queries

**Log Search with Full-Text**:
```sql
SELECT
    Timestamp,
    ServiceName,
    SeverityText,
    Body,
    LogAttributes
FROM otel.logs_distributed
WHERE
    ServiceName = {service:String}
    AND Timestamp >= {start:DateTime64}
    AND Timestamp <= {end:DateTime64}
    AND hasToken(Body, {term:String})
ORDER BY Timestamp DESC
LIMIT 100;
```

**Trace Retrieval**:
```sql
SELECT
    Timestamp,
    TraceId,
    SpanId,
    ParentSpanId,
    SpanName,
    ServiceName,
    Duration,
    StatusCode,
    SpanAttributes
FROM otel.traces_distributed
WHERE TraceId = {traceId:String}
ORDER BY Timestamp ASC;
```

**Service Error Rate**:
```sql
SELECT
    ServiceName,
    count() as total,
    countIf(StatusCode = 'ERROR') as errors,
    round(errors / total * 100, 2) as error_rate
FROM otel.traces_distributed
WHERE
    Timestamp >= now() - INTERVAL 1 HOUR
    AND SpanKind = 'SERVER'
GROUP BY ServiceName
ORDER BY error_rate DESC;
```

**P99 Latency by Service**:
```sql
SELECT
    ServiceName,
    SpanName,
    quantile(0.50)(Duration) / 1000000 as p50_ms,
    quantile(0.95)(Duration) / 1000000 as p95_ms,
    quantile(0.99)(Duration) / 1000000 as p99_ms,
    count() as request_count
FROM otel.traces_distributed
WHERE
    Timestamp >= now() - INTERVAL 1 HOUR
    AND SpanKind = 'SERVER'
GROUP BY ServiceName, SpanName
ORDER BY p99_ms DESC;
```

### Phase 3: Visualization & Alerting (Week 5-6)

#### 3.1 Grafana Integration

Configure Grafana with ClickHouse data source:

```yaml
# grafana/provisioning/datasources/clickhouse.yaml
apiVersion: 1
datasources:
  - name: ClickHouse
    type: grafana-clickhouse-datasource
    access: proxy
    url: http://clickhouse-cluster:8123
    jsonData:
      defaultDatabase: otel
      protocol: http
    secureJsonData:
      password: ${CLICKHOUSE_PASSWORD}
```

#### 3.2 Essential Dashboards

1. **Service Overview**
   - Request rate, error rate, latency (RED metrics)
   - Service dependency map
   - Recent traces and logs

2. **Log Explorer**
   - Full-text search
   - Severity distribution
   - Log volume over time

3. **Trace Explorer**
   - Trace search and filtering
   - Trace waterfall visualization
   - Span analysis

4. **Infrastructure**
   - Host metrics
   - Collector health
   - ClickHouse performance

#### 3.3 Alerting Rules

```yaml
# Example Prometheus alerting rules for collector health
groups:
  - name: otel-collector
    rules:
      - alert: CollectorHighMemory
        expr: process_resident_memory_bytes{job="otel-collector"} > 3e9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Collector memory usage high"

      - alert: CollectorExportFailures
        expr: rate(otelcol_exporter_send_failed_spans_total[5m]) > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Collector failing to export spans"
```

### Phase 4: Production Hardening (Week 7-8)

#### 4.1 High Availability

**ClickHouse HA Configuration**:
```xml
<!-- clickhouse/config.d/remote_servers.xml -->
<clickhouse>
    <remote_servers>
        <otel_cluster>
            <shard>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>clickhouse-03</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-04</host>
                    <port>9000</port>
                </replica>
            </shard>
        </otel_cluster>
    </remote_servers>
</clickhouse>
```

**Collector Load Balancing**:
```yaml
# Use loadbalancing exporter for distributing across gateways
exporters:
  loadbalancing:
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: gateway.otel.svc
        port: 4317
```

#### 4.2 Data Lifecycle Management

```sql
-- Create materialized view for trace ID lookup optimization
CREATE MATERIALIZED VIEW otel.traces_trace_id_ts
ENGINE = ReplicatedMergeTree
ORDER BY (TraceId, MinTimestamp)
AS SELECT
    TraceId,
    min(Timestamp) as MinTimestamp,
    max(Timestamp) as MaxTimestamp
FROM otel.traces
GROUP BY TraceId;

-- Downsampling for metrics (1-minute aggregations)
CREATE MATERIALIZED VIEW otel.metrics_1m
ENGINE = ReplicatedAggregatingMergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, MetricName, toStartOfMinute(Timestamp))
AS SELECT
    ServiceName,
    MetricName,
    toStartOfMinute(Timestamp) as Timestamp,
    avgState(Value) as AvgValue,
    minState(Value) as MinValue,
    maxState(Value) as MaxValue,
    countState() as Count
FROM otel.metrics_gauge
GROUP BY ServiceName, MetricName, toStartOfMinute(Timestamp);
```

#### 4.3 Security

1. **TLS Everywhere**
   - Collector ↔ Collector: mTLS
   - Collector ↔ ClickHouse: TLS
   - API ↔ ClickHouse: TLS

2. **Authentication**
   - ClickHouse RBAC with dedicated users
   - API authentication (OAuth2/API keys)
   - Grafana SSO integration

3. **Network Policies**
   - Restrict collector ingress
   - Limit ClickHouse access to collectors only
   - Segment by environment

### Phase 5: Operations & Scaling (Ongoing)

#### 5.1 Monitoring the Monitors

```yaml
# Self-monitoring configuration
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          static_configs:
            - targets: ['localhost:8888']
        - job_name: 'clickhouse'
          static_configs:
            - targets: ['clickhouse:9363']
```

#### 5.2 Capacity Planning

| Scale | Daily Volume | Collectors | ClickHouse Nodes | Storage/Day |
|-------|-------------|------------|------------------|-------------|
| Small | 10GB | 3 agents | 1 node | ~1.5GB |
| Medium | 100GB | 10 agents + 3 gateways | 3 nodes | ~15GB |
| Large | 1TB | 50 agents + 10 gateways | 6+ nodes | ~150GB |
| XL | 10TB+ | 200+ agents + 20+ gateways | 12+ nodes | ~1.5TB |

#### 5.3 Performance Tuning

**ClickHouse Settings**:
```sql
-- Optimize for insert-heavy workload
ALTER TABLE otel.logs MODIFY SETTING
    parts_to_throw_insert = 500,
    max_parts_in_total = 10000,
    merge_with_ttl_timeout = 14400;
```

**Collector Tuning**:
```yaml
processors:
  batch:
    # Increase batch size for better ClickHouse performance
    send_batch_size: 10000
    send_batch_max_size: 20000
    timeout: 10s
```

---

## Part 5: Custom Components (Optional)

### Building a Custom Processor

```go
// processor/customprocessor/processor.go
package customprocessor

import (
    "context"
    "go.opentelemetry.io/collector/pdata/plog"
    "go.opentelemetry.io/collector/processor"
)

type customProcessor struct {
    config *Config
    next   consumer.Logs
}

func (p *customProcessor) ConsumeLogs(ctx context.Context, ld plog.Logs) error {
    // Custom processing logic here
    for i := 0; i < ld.ResourceLogs().Len(); i++ {
        rl := ld.ResourceLogs().At(i)
        // Enrich, filter, transform...
    }
    return p.next.ConsumeLogs(ctx, ld)
}
```

### Building Custom Collector Distribution

```yaml
# builder-config.yaml
dist:
  name: maple-otelcol
  output_path: ./dist
  otelcol_version: 0.96.0

receivers:
  - gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.96.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/filelogreceiver v0.96.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/hostmetricsreceiver v0.96.0

processors:
  - gomod: go.opentelemetry.io/collector/processor/batchprocessor v0.96.0
  - gomod: go.opentelemetry.io/collector/processor/memorylimiterprocessor v0.96.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/tailsamplingprocessor v0.96.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/transformprocessor v0.96.0

exporters:
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/exporter/clickhouseexporter v0.96.0
  - gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.96.0
  - gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.96.0

extensions:
  - gomod: go.opentelemetry.io/collector/extension/zpagesextension v0.96.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/extension/healthcheckextension v0.96.0
  - gomod: github.com/open-telemetry/opentelemetry-collector-contrib/extension/pprofextension v0.96.0
```

Build with:
```bash
go install go.opentelemetry.io/collector/cmd/builder@latest
builder --config=builder-config.yaml
```

---

## Part 6: Technology Stack Summary

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Instrumentation** | OTel SDKs | Application instrumentation |
| **Collection** | OTel Collector (Agent) | Local telemetry collection |
| **Aggregation** | OTel Collector (Gateway) | Centralized processing, sampling |
| **Storage** | ClickHouse | Time-series OLAP database |
| **Coordination** | ClickHouse Keeper | Cluster coordination |
| **Query** | Custom API | Query abstraction layer |
| **Visualization** | Grafana | Dashboards and exploration |
| **Alerting** | Alertmanager | Alert routing and management |

---

## References

- [OpenTelemetry Collector Documentation](https://opentelemetry.io/docs/collector/)
- [ClickHouse Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)
- [ClickHouse Observability Guide](https://clickhouse.com/docs/observability/integrating-opentelemetry)
- [Building Observability with ClickHouse - Logs](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- [Building Observability with ClickHouse - Traces](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

---

## Part 7: Lessons from HyperDX

HyperDX is an open-source observability platform that serves as the UI layer for ClickStack. Analyzing their architecture provides valuable insights for our implementation.

### 7.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HyperDX Architecture                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     Frontend (Next.js + React)                        │   │
│  │  - Mantine UI components                                              │   │
│  │  - Jotai (atomic state) + React Query (server state)                  │   │
│  │  - CodeMirror for SQL editing                                         │   │
│  │  - UPlot/Recharts for visualization                                   │   │
│  │  - nuqs for URL state sync                                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      API Layer (Express.js)                           │   │
│  │  - ClickHouse query proxy with auth                                   │   │
│  │  - OpAMP server for dynamic collector config                          │   │
│  │  - Alert management (cron-based)                                      │   │
│  │  - Team/multi-tenant support                                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                    │                              │                          │
│                    ▼                              ▼                          │
│  ┌────────────────────────┐      ┌────────────────────────────────────┐    │
│  │       MongoDB          │      │      OpenTelemetry Collector        │    │
│  │  - Team metadata       │      │  - Dynamic config via OpAMP         │    │
│  │  - Saved searches      │      │  - OTLP, Fluentd, Prometheus        │    │
│  │  - Alert definitions   │      │  - Transform processor              │    │
│  │  - Source mappings     │      │  - ClickHouse exporter              │    │
│  └────────────────────────┘      └────────────────────────────────────┘    │
│                                                   │                          │
│                                                   ▼                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         ClickHouse                                    │   │
│  │  - otel_logs, otel_traces, hyperdx_sessions                          │   │
│  │  - Metrics tables (gauge, sum, histogram, summary)                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Design Patterns from HyperDX

#### Schema-Agnostic Source Model

HyperDX uses a "Source" abstraction that maps arbitrary ClickHouse tables to their internal representation using **expression-based field mapping**:

```typescript
// HyperDX Source Model (simplified)
interface Source {
  team: ObjectId;                      // Multi-tenant isolation
  connection: ObjectId;                // ClickHouse connection reference
  from: { database: string; table: string };
  kind: 'log' | 'trace' | 'metric' | 'session';

  // Expression-based mappings (not rigid column names)
  timestampValueExpression: string;    // e.g., "Timestamp"
  serviceNameExpression: string;       // e.g., "ServiceName"
  bodyExpression: string;              // e.g., "Body"
  traceIdExpression: string;           // e.g., "TraceId"
  severityTextExpression: string;      // e.g., "SeverityText"
  resourceAttributesExpression: string;
  eventAttributesExpression: string;

  // Query optimization
  tableFilterExpression: string;       // Default WHERE clause
  defaultTableSelectExpression: string;
}
```

**Why this matters**: Instead of requiring a specific schema, HyperDX can work with any existing ClickHouse table by defining how to extract semantic fields. This is crucial for:
- Migrating from other systems
- Supporting custom schemas
- Working with pre-existing data

#### Dynamic Collector Configuration via OpAMP

HyperDX implements OpAMP (Open Agent Management Protocol) for dynamic collector configuration instead of static YAML files:

```typescript
// Dynamic configuration building (from opampController.ts)
function buildOtelCollectorConfig(apiKeys: string[]): CollectorConfig {
  const config = {
    receivers: {
      'otlp/hyperdx': {
        protocols: {
          grpc: { endpoint: '0.0.0.0:4317' },
          http: { endpoint: '0.0.0.0:4318', cors: { allowed_origins: ['*'] } }
        }
      },
      fluentforward: { endpoint: '0.0.0.0:24225' },
      prometheus: { /* scrape configs */ }
    },
    processors: {
      transform: {
        log_statements: [
          // Auto-parse JSON from log body
          // Infer severity from keywords (ERROR, WARN, DEBUG)
          // Flatten nested attributes
        ]
      },
      resourcedetection: { detectors: ['env', 'system', 'docker'] },
      batch: {},
      memory_limiter: { limit_mib: 1500, spike_limit_mib: 512 }
    },
    exporters: {
      clickhouse: { /* ClickHouse connection */ }
    }
  };

  // Dynamic: Add auth if API keys exist
  if (apiKeys.length > 0) {
    config.extensions = {
      bearertoken: { tokens: apiKeys }
    };
  }

  return config;
}
```

**Benefits**:
- No collector restart needed for config changes
- Centralized configuration management
- API key rotation without downtime
- Per-team receiver authentication

#### Materialized Columns for Hot Paths

HyperDX pre-materializes frequently accessed Kubernetes metadata:

```sql
-- HyperDX's materialized columns approach
CREATE TABLE otel_logs (
    -- ... standard columns ...

    -- Materialized from ResourceAttributes Map
    `__hdx_materialized_k8s.cluster.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.cluster.name'],
    `__hdx_materialized_k8s.namespace.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.namespace.name'],
    `__hdx_materialized_k8s.pod.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.pod.name'],
    `__hdx_materialized_k8s.container.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.container.name'],
    `__hdx_materialized_deployment.environment.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['deployment.environment']
)
```

**Performance impact**: Queries filtering by `k8s.pod.name` are dramatically faster when using the materialized column vs. `ResourceAttributes['k8s.pod.name']`.

#### Transform Processor for Log Intelligence

HyperDX's collector configuration includes smart log processing:

```yaml
processors:
  transform:
    log_statements:
      - context: log
        statements:
          # Auto-parse JSON bodies into attributes
          - merge_maps(attributes, ParseJSON(body), "upsert")
              where IsMatch(body, "^\\s*\\{")

          # Infer severity from body content
          - set(severity_text, "error")
              where IsMatch(body, "(?i)(error|err|exception|fatal|panic)")
          - set(severity_text, "warn")
              where IsMatch(body, "(?i)(warn|warning)")
          - set(severity_text, "debug")
              where IsMatch(body, "(?i)(debug|trace)")
          - set(severity_text, "info")
              where severity_text == "" and body != ""
```

### 7.3 HyperDX Schema Deep Dive

#### Enhanced Logs Table

```sql
CREATE TABLE otel_logs (
    -- Timestamps with two granularities
    Timestamp DateTime64(9) CODEC(Delta, ZSTD(1)),
    TimestampTime DateTime DEFAULT toDateTime(Timestamp),

    -- Correlation IDs
    TraceId String CODEC(ZSTD(1)),
    SpanId String CODEC(ZSTD(1)),
    TraceFlags UInt8,

    -- Severity (optimized for filtering)
    SeverityText LowCardinality(String) CODEC(ZSTD(1)),
    SeverityNumber UInt8,

    -- Service identification
    ServiceName LowCardinality(String) CODEC(ZSTD(1)),

    -- Main content
    Body String CODEC(ZSTD(1)),

    -- Flexible attributes (Map type)
    ResourceAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    LogAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    ScopeAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    ScopeName String CODEC(ZSTD(1)),
    ScopeVersion LowCardinality(String) CODEC(ZSTD(1)),

    -- Materialized K8s columns for fast filtering
    `__hdx_materialized_k8s.cluster.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.cluster.name'] CODEC(ZSTD(1)),
    `__hdx_materialized_k8s.namespace.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.namespace.name'] CODEC(ZSTD(1)),
    `__hdx_materialized_k8s.pod.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.pod.name'] CODEC(ZSTD(1)),
    `__hdx_materialized_k8s.container.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['k8s.container.name'] CODEC(ZSTD(1)),
    `__hdx_materialized_deployment.environment.name` LowCardinality(String)
        MATERIALIZED ResourceAttributes['deployment.environment'] CODEC(ZSTD(1)),

    -- Indexes for fast lookups
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_lower_body lower(Body) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(TimestampTime)
PRIMARY KEY (ServiceName, TimestampTime)
ORDER BY (ServiceName, TimestampTime, Timestamp)
TTL TimestampTime + toIntervalDay(30)
SETTINGS ttl_only_drop_parts = 1, index_granularity = 8192;
```

**Key optimizations**:
1. **Dual timestamp columns**: `TimestampTime` (DateTime) for partitioning/ordering, `Timestamp` (DateTime64) for precision
2. **Case-insensitive full-text**: `lower(Body)` index for case-insensitive search
3. **Map key/value bloom filters**: Fast attribute existence and value checks
4. **`ttl_only_drop_parts = 1`**: Drop entire partitions instead of row-by-row deletion

#### Enhanced Traces Table

```sql
CREATE TABLE otel_traces (
    Timestamp DateTime64(9) CODEC(Delta, ZSTD(1)),
    TraceId String CODEC(ZSTD(1)),
    SpanId String CODEC(ZSTD(1)),
    ParentSpanId String CODEC(ZSTD(1)),
    TraceState String CODEC(ZSTD(1)),
    SpanName LowCardinality(String) CODEC(ZSTD(1)),
    SpanKind LowCardinality(String) CODEC(ZSTD(1)),
    ServiceName LowCardinality(String) CODEC(ZSTD(1)),
    Duration UInt64 CODEC(ZSTD(1)),  -- nanoseconds
    StatusCode LowCardinality(String) CODEC(ZSTD(1)),
    StatusMessage String CODEC(ZSTD(1)),

    -- Attributes
    ResourceAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    SpanAttributes Map(LowCardinality(String), String) CODEC(ZSTD(1)),

    -- Events (Nested type for efficiency)
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),

    -- Links to other traces
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),

    -- Session replay correlation
    `__hdx_materialized_rum.sessionId` String
        MATERIALIZED SpanAttributes['rum.sessionId'] CODEC(ZSTD(1)),

    -- Indexes
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp64Nano(Timestamp), TraceId)
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS ttl_only_drop_parts = 1;
```

### 7.4 Search Interface Design

HyperDX supports multiple query syntaxes:

#### Lucene-Style Syntax (User-Friendly)
```
level:error service:api-gateway "connection refused"
```

#### Property Search
```
service:payment-service status:500 duration:>1000
k8s.pod.name:payment-* environment:production
```

#### Native SQL (Power Users)
```sql
SELECT Timestamp, ServiceName, Body
FROM otel_logs
WHERE ServiceName = 'api-gateway'
  AND SeverityText = 'error'
  AND hasToken(lower(Body), 'timeout')
ORDER BY Timestamp DESC
LIMIT 100
```

**Implementation pattern**: The frontend translates Lucene-style queries to SQL, providing users flexibility while maintaining ClickHouse's query performance.

### 7.5 API Design Patterns

#### ClickHouse Proxy with Auth

```typescript
// HyperDX's ClickHouse proxy pattern
app.post('/clickhouse-proxy', async (req, res) => {
  const connectionId = req.headers['x-hyperdx-connection-id'];
  const connection = await Connection.findById(connectionId);

  // Validate team access
  if (connection.team.toString() !== req.user.team.toString()) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Forward to ClickHouse with auth headers
  const response = await fetch(connection.endpoint, {
    method: 'POST',
    headers: {
      'X-ClickHouse-User': connection.username,
      'X-ClickHouse-Key': connection.password,
    },
    body: req.body.query,
  });

  return res.json(await response.json());
});
```

#### Modular Router Structure

```typescript
// API router organization
/api/
├── /alerts          - CRUD for alert definitions
├── /dashboards      - Dashboard management
├── /team            - Multi-tenant team management
├── /connections     - ClickHouse connection configs
├── /sources         - Data source definitions (schema mappings)
├── /saved-search    - Saved search queries
├── /clickhouse-proxy - Direct query proxy
├── /ai              - AI-powered insights (Anthropic SDK)
└── /webhooks        - Alert notifications
```

### 7.6 Recommendations for Our Platform

Based on HyperDX's architecture, we should incorporate:

1. **Schema Flexibility via Source Model**
   - Don't hardcode column names
   - Use expression-based mapping for field extraction
   - Support connecting to existing ClickHouse tables

2. **Dynamic Collector Configuration**
   - Implement OpAMP for runtime config updates
   - Support per-tenant API key authentication
   - Enable receiver hot-reload

3. **Optimized Schema Design**
   - Add `TimestampTime DateTime` for efficient partitioning
   - Materialize frequently-queried K8s attributes
   - Use `lower(Body)` index for case-insensitive search
   - Add bloom filters on Map keys and values

4. **Dual Query Interface**
   - Lucene-style for quick searches (`level:error service:api`)
   - Full SQL for power users
   - Query translation layer between syntaxes

5. **Multi-Tenant Architecture**
   - Team-based isolation from day one
   - Connection-per-team model
   - API key scoping

6. **Session Replay Support**
   - Dedicated `sessions` table
   - RUM sessionId correlation with traces
   - RRWeb event storage

### 7.7 Technology Stack Comparison

| Component | HyperDX | Maple Platform |
|-----------|---------|----------------|
| **Framework** | Next.js + React 19 | **TanStack Start** |
| **UI Components** | Mantine | **shadcn/ui** |
| **State** | Jotai + React Query | **TanStack Query** (built-in) |
| **API** | Express.js | **TanStack Start Server Functions** |
| **Metadata DB** | MongoDB | **SQLite** (simple, zero-config) |
| **Auth** | Session-based + API keys | **Better Auth** (lightweight, SQLite-native) |
| **Visualization** | UPlot + Recharts | UPlot + Recharts |

---

## Part 8: Finalized Implementation Plan

### Our Technology Stack

#### Core Framework: TanStack Start
- Full-stack React framework with file-based routing
- Built-in server functions for API endpoints
- SSR/SSG support out of the box
- Excellent TypeScript support

#### UI: shadcn/ui
- Copy-paste components (not a library dependency)
- Tailwind CSS based
- Fully customizable
- Accessible by default (Radix primitives)

#### Database: SQLite
- Zero configuration, single file
- Perfect for self-hosted deployments
- Fast reads for metadata operations
- Use with Drizzle ORM for type safety

#### Authentication: Better Auth
- Lightweight, open-source
- Native SQLite support
- TanStack Start integration via `tanstackStartCookies` plugin
- Supports email/password, OAuth, magic links
- Session-based with secure cookies

### Updated Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Maple Platform                                  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   TanStack Start (Full-Stack React)                   │   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │                        Frontend                                  │  │   │
│  │  │  - shadcn/ui components                                          │  │   │
│  │  │  - TanStack Query (data fetching)                                │  │   │
│  │  │  - TanStack Router (file-based routing)                          │  │   │
│  │  │  - CodeMirror (SQL + Lucene editor)                              │  │   │
│  │  │  - UPlot + Recharts (visualization)                              │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                │                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │                    Server Functions (API)                        │  │   │
│  │  │  /api/                                                           │  │   │
│  │  │  ├── /auth/$     - Better Auth handler                           │  │   │
│  │  │  ├── /logs       - Log search, aggregation, live tail            │  │   │
│  │  │  ├── /traces     - Trace search, retrieval, service map          │  │   │
│  │  │  ├── /metrics    - Metric queries                                │  │   │
│  │  │  ├── /sources    - Schema-agnostic source definitions            │  │   │
│  │  │  ├── /alerts     - Alert CRUD and webhooks                       │  │   │
│  │  │  └── /query      - Raw ClickHouse SQL proxy                      │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                    │                              │                          │
│                    ▼                              ▼                          │
│  ┌────────────────────────┐      ┌────────────────────────────────────┐    │
│  │   SQLite + Drizzle     │      │      OTel Collector (Gateway)       │    │
│  │  maple.db              │      │  - OTLP gRPC/HTTP receivers          │    │
│  │  ├── users             │      │  - Transform (JSON parse, severity) │    │
│  │  ├── sessions          │      │  - Batch + Memory limiter           │    │
│  │  ├── sources           │      │  - ClickHouse exporter              │    │
│  │  ├── alerts            │      └────────────────────────────────────┘    │
│  │  ├── dashboards        │                       │                          │
│  │  └── saved_searches    │                       ▼                          │
│  └────────────────────────┘      ┌────────────────────────────────────┐    │
│                                   │         ClickHouse                  │    │
│                                   │  - otel_logs                        │    │
│                                   │  - otel_traces                      │    │
│                                   │  - otel_metrics_*                   │    │
│                                   └────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
maple/
├── app/
│   ├── routes/
│   │   ├── __root.tsx              # Root layout with auth provider
│   │   ├── index.tsx               # Dashboard home
│   │   ├── login.tsx               # Login page
│   │   ├── logs/
│   │   │   └── index.tsx           # Log explorer
│   │   ├── traces/
│   │   │   ├── index.tsx           # Trace search
│   │   │   └── $traceId.tsx        # Trace detail view
│   │   ├── services/
│   │   │   └── index.tsx           # Service map
│   │   ├── alerts/
│   │   │   └── index.tsx           # Alert management
│   │   ├── dashboards/
│   │   │   ├── index.tsx           # Dashboard list
│   │   │   └── $id.tsx             # Dashboard view/edit
│   │   └── api/
│   │       ├── auth/
│   │       │   └── $.ts            # Better Auth catch-all handler
│   │       ├── logs.ts             # Log search API
│   │       ├── traces.ts           # Trace search API
│   │       ├── query.ts            # Raw ClickHouse proxy
│   │       └── sources.ts          # Source management
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── log-table.tsx
│   │   ├── trace-waterfall.tsx
│   │   ├── search-bar.tsx
│   │   └── service-map.tsx
│   └── lib/
│       ├── auth.ts                 # Better Auth instance
│       ├── auth-client.ts          # Client-side auth
│       ├── db.ts                   # Drizzle + SQLite
│       ├── clickhouse.ts           # ClickHouse client
│       └── query-parser.ts         # Lucene to SQL
├── drizzle/
│   ├── schema.ts                   # SQLite schema
│   └── migrations/
├── maple.db                        # SQLite database file
├── drizzle.config.ts
├── app.config.ts                   # TanStack Start config
└── package.json
```

### Better Auth Setup

```typescript
// app/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Database from "better-sqlite3";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
  },
  // Optional: Add OAuth providers
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
});

// app/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### API Route Handler (Better Auth)

```typescript
// app/routes/api/auth/$.ts
import { createAPIFileRoute } from "@tanstack/start/api";
import { auth } from "~/lib/auth";

export const Route = createAPIFileRoute("/api/auth/$")({
  GET: async ({ request }) => {
    return auth.handler(request);
  },
  POST: async ({ request }) => {
    return auth.handler(request);
  },
});
```

### Protected Route Pattern

```typescript
// app/routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    // Public routes that don't need auth
    const publicRoutes = ["/login", "/signup", "/forgot-password"];
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    // Redirect to login if not authenticated
    if (!session.data) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user: session.data.user };
  },
  component: () => <Outlet />,
});
```

### SQLite Schema (Drizzle)

```typescript
// drizzle/schema.ts
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

// Better Auth tables (auto-generated, but shown for reference)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }),
  name: text("name"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// Application tables
export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["log", "trace", "metric"] }).notNull(),
  database: text("database").notNull(),
  tableName: text("table_name").notNull(),

  // Expression-based field mappings (HyperDX pattern)
  timestampExpression: text("timestamp_expression").notNull(),
  serviceNameExpression: text("service_name_expression"),
  bodyExpression: text("body_expression"),
  traceIdExpression: text("trace_id_expression"),
  severityExpression: text("severity_expression"),
  resourceAttributesExpression: text("resource_attributes_expression"),

  // Query defaults
  defaultFilter: text("default_filter"),
  defaultSelect: text("default_select"),

  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const savedSearches = sqliteTable("saved_searches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  sourceId: text("source_id").references(() => sources.id),
  query: text("query").notNull(),        // Lucene-style query
  sqlQuery: text("sql_query"),           // Generated SQL
  timeRange: text("time_range"),         // JSON: { from, to, relative }
  columns: text("columns"),              // JSON array of selected columns
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  sourceId: text("source_id").references(() => sources.id),
  query: text("query").notNull(),
  condition: text("condition").notNull(), // JSON: { operator, threshold }
  interval: text("interval").notNull(),   // cron expression or interval
  webhookUrl: text("webhook_url"),
  slackWebhook: text("slack_webhook"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  lastTriggeredAt: integer("last_triggered_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const dashboards = sqliteTable("dashboards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  layout: text("layout").notNull(),       // JSON: grid layout config
  panels: text("panels").notNull(),       // JSON: array of panel configs
  filters: text("filters"),               // JSON: dashboard-level filters
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
```

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize TanStack Start project with TypeScript
- [ ] Set up shadcn/ui components
- [ ] Configure SQLite + Drizzle ORM
- [ ] Implement Better Auth (email/password)
- [ ] Set up ClickHouse with optimized schema
- [ ] Deploy OTel Collector with transform processor
- [ ] Create basic ClickHouse query proxy API

### Phase 2: Search Experience (Week 3-4)
- [ ] Build log search UI with search bar component
- [ ] Implement Lucene-to-SQL query parser
- [ ] Create log table with virtual scrolling
- [ ] Implement trace waterfall visualization
- [ ] Add live tail with SSE or polling
- [ ] Build Source model CRUD

### Phase 3: Advanced Features (Week 5-6)
- [ ] Dashboard builder with react-grid-layout
- [ ] Alert system with node-cron evaluation
- [ ] Webhook integrations (Slack, generic)
- [ ] Saved searches management
- [ ] Service map visualization

### Phase 4: Production (Week 7-8)
- [ ] Add OAuth providers (GitHub, Google)
- [ ] Performance optimization
- [ ] Docker Compose deployment
- [ ] Documentation
- [ ] Load testing

---

## References

- [OpenTelemetry Collector Documentation](https://opentelemetry.io/docs/collector/)
- [ClickHouse Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)
- [ClickHouse Observability Guide](https://clickhouse.com/docs/observability/integrating-opentelemetry)
- [HyperDX GitHub Repository](https://github.com/hyperdxio/hyperdx)
- [ClickStack - Official ClickHouse Observability Stack](https://github.com/ClickHouse/clickstack)
- [HyperDX Documentation](https://www.hyperdx.io/docs/v2)
- [Building Observability with ClickHouse - Logs](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- [Building Observability with ClickHouse - Traces](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
