variable "name" {
  type        = string
  description = "App environment name."
}

variable "image" {
  type        = string
  description = "Container image to deploy once a runtime platform is selected."
}

variable "database_url" {
  type        = string
  description = "Database URL supplied by the database module or secret manager."
  sensitive   = true
}

variable "event_brokers" {
  type        = string
  description = "Kafka-compatible broker list supplied by the events module."
}

output "app_runtime_placeholder" {
  value       = "${var.name}:${var.image}"
  description = "Placeholder output; this skeleton creates no app resources."
}
