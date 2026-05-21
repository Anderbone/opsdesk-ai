# Skeleton only. This environment intentionally has no provider block and creates no resources.

module "network" {
  source = "../../modules/network"

  name = "opsdesk-ai-dev"
}

module "database" {
  source = "../../modules/database"

  name                  = "opsdesk-ai-dev"
  pgvector_required     = true
  backup_retention_days = 7
}

module "events" {
  source = "../../modules/events"

  name   = "opsdesk-ai-dev"
  topics = ["opsdesk.ticket.lifecycle", "opsdesk.ai.actions", "opsdesk.documents", "opsdesk.followups"]
}

module "search" {
  source = "../../modules/search"

  name        = "opsdesk-ai-dev"
  index_names = ["opsdesk_knowledge"]
}

module "observability" {
  source = "../../modules/observability"

  name = "opsdesk-ai-dev"
}

module "storage" {
  source = "../../modules/storage"

  name = "opsdesk-ai-dev"
}

module "app" {
  source = "../../modules/app"

  name          = "opsdesk-ai-dev"
  image         = "example.invalid/opsdesk-ai:replace-me"
  database_url  = module.database.database_url_placeholder
  event_brokers = module.events.brokers_placeholder
}
