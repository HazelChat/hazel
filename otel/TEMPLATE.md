[OpenTelemetry](https://opentelemetry.io/) is an open-source observability framework for collecting, processing, and exporting telemetry data (metrics, traces, and logs) from your applications and infrastructure.

Integrating Tinybird as an OpenTelemetry backend, you can analyze observability data in real time, build dashboards, and enrich it with other data sources.

Learn more about observability with Tinybird at https://www.tinybird.co/observability

## Setup the project

Fork the GitHub repository and deploy the data project to Tinybird.

```bash
# select or create a new workspace
tb login

# deploy the template
tb --cloud deploy --template https://github.com/tinybirdco/tinybird-otel-template/tree/main/

# you'll need this token for the opentelemetry exporter configuration
tb --cloud token copy OTEL_TINYBIRD_TOKEN

# check your Tinybird API host needed for the opentelemetry exporter configuration
tb info
```

## Send logs, metrics and traces

Paste the Tinybird OpenTelemetry `exporter` configuration into your OTel collector instance:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 8192

exporters:
  tinybird:
    endpoint: ${OTEL_TINYBIRD_API_HOST}         # Your Events API endpoint, e.g. https://api.us-east.aws.tinybird.co
    token: ${OTEL_TINYBIRD_TOKEN}               # Token with append permissions
    sending_queue:
      enabled: true
      queue_size: 104857600                # Total memory buffer in bytes (100 MB)
      sizer: bytes
      batch:
        flush_timeout: 5s                  # Max wait time before flushing
        min_size: 1024000                  # Min batch size: 1 MB
        max_size: 8388608                  # Max batch size: 8 MB (Events API limit is 10 MB)
    retry_on_failure:
      enabled: true
    metrics:
      sum:
        datasource: otel_metrics_sum
      histogram:
        datasource: otel_metrics_histogram
      exponential_histogram:
        datasource: otel_metrics_exponential_histogram
      gauge:
        datasource: otel_metrics_gauge
    logs:
      datasource: otel_logs
    traces:
      datasource: otel_traces

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [tinybird]

    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [tinybird]

    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [tinybird]
```

> [!TIP]
> The Tinybird OpenTelemetry Exporter is officially available in the [OpenTelemetry Collector Contrib repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/tinybirdexporter) as of release v0.131.0. You can use the official OpenTelemetry Collector distributions that include the Tinybird exporter out of the box.

Make sure you are running a release version of the OpenTelemetry Collector higher than release v0.131.0.

- [GitHub Releases](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases)
- [Docker Hub](https://hub.docker.com/r/otel/opentelemetry-collector-contrib)

### Environment variables

* `OTEL_TINYBIRD_API_HOST`: The API host for your Tinybird workspace (e.g., `https://api.tinybird.co`). You can get it with `tb info`
* `OTEL_TINYBIRD_TOKEN`: A Tinybird token with **append** permissions to the target Data Sources (`otel_metrics`, `otel_traces`, `otel_logs`). Grab yours with `tb --cloud token copy OTEL_TINYBIRD_TOKEN`

## Analyzing logs, traces and metrics with Grafana

You can connect your logs, traces and metrics in Tinybird to compatible visualization tools using the [ClickHouse HTTP interface](https://www.tinybird.co/docs/forward/work-with-data/publish-data/clickhouse-interface).

Learn how to use [Grafana](https://www.tinybird.co/docs/forward/work-with-data/publish-data/guides/connect-grafana) to explore logs, traces and build alerts out of your metrics.

## opentelemetry-demo

Clone the [opentelemetry-demo](https://github.com/tinybirdco/opentelemetry-demo) repository for a quick demo on how to run the whole observability stack locally
