variable "name" {
  type        = string
  description = "Environment name used when a real network module is selected."
}

output "network_id_placeholder" {
  value       = "replace-with-network-id-for-${var.name}"
  description = "Placeholder output; this skeleton creates no network resources."
}
