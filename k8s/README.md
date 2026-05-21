# OpsDesk AI Kubernetes Path

These manifests are a credible local/production deployment shape, not a required demo path. They are not used by `pnpm dev`, Netlify, or normal verification.

## Files

- `configmap.yaml` defines non-secret runtime configuration.
- `secret.example.yaml` documents required secret keys without real values.
- `web-deployment.yaml` runs the React Router server.
- `worker-deployment.yaml` runs the background worker.
- `service.yaml` exposes the web deployment inside the cluster.
- `hpa.yaml` shows autoscaling constraints for the web deployment.

## Prerequisites Before Applying

- Build and publish a real container image.
- Provision Postgres/pgvector and provide `DATABASE_URL`.
- Decide which optional adapters are enabled: Redpanda, OpenSearch, Neo4j, webhook outbound delivery.
- Add real readiness and liveness endpoints. The manifests reference `/healthz` and `/readyz`; those endpoints do not exist yet.
- Use a proper secret manager or sealed secret process instead of committing live secrets.

## Example Inspection

```bash
kubectl apply --dry-run=client -f k8s/
```
