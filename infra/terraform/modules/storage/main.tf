variable "name" {
  type        = string
  description = "Storage environment name."
}

output "bucket_placeholder" {
  value       = "opsdesk-ai-${var.name}-documents"
  description = "Placeholder object storage name; no bucket is created."
}
