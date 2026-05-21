variable "name" {
  type        = string
  description = "Observability environment name."
}

output "otel_endpoint_placeholder" {
  value       = "https://observability.example.invalid/${var.name}"
  description = "Placeholder only; real endpoints belong in managed config."
}
