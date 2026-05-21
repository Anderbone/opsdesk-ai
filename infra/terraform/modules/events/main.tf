variable "name" {
  type        = string
  description = "Events environment name."
}

variable "topics" {
  type        = list(string)
  description = "Kafka-compatible topics expected by the event bus adapter."
}

output "brokers_placeholder" {
  value       = "localhost:9092"
  description = "Placeholder broker list for module wiring only."
}

output "topics" {
  value       = var.topics
  description = "Topic contract names reserved for the future events module."
}
