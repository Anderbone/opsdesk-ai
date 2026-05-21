variable "name" {
  type        = string
  description = "Search environment name."
}

variable "index_names" {
  type        = list(string)
  description = "OpenSearch indexes expected by the search adapter."
}

output "opensearch_url_placeholder" {
  value       = "https://search.example.invalid/${var.name}"
  description = "Placeholder only; no OpenSearch domain is created by this skeleton."
}
