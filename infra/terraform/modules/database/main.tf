variable "name" {
  type        = string
  description = "Database environment name."
}

variable "pgvector_required" {
  type        = bool
  description = "Whether the future Postgres service must enable pgvector."
  default     = true
}

variable "backup_retention_days" {
  type        = number
  description = "Future backup retention policy."
  default     = 7
}

output "database_url_placeholder" {
  value       = "postgres://replace-with-secret-for-${var.name}"
  description = "Placeholder only; put real URLs in a secret manager."
  sensitive   = true
}
