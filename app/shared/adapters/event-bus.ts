import { deadLetterEvents, eventEnvelopes } from "~/lib/event-data";
import type { DeadLetterEvent, EventEnvelope } from "~/lib/types";
import type { RuntimeConfig } from "~/shared/config/runtime";
import { getRuntimeConfig } from "~/shared/config/runtime";

export type PublishResult = {
  accepted: boolean;
  duplicate: boolean;
  envelope: EventEnvelope;
};

export type EventHandler = (envelope: EventEnvelope) => Promise<void> | void;

export type EventRetryMetadata = {
  attempt: number;
  maxAttempts: number;
  lastError?: string;
};

export type EventBus = {
  publish(envelope: EventEnvelope): Promise<PublishResult>;
  subscribe(topic: string, handler: EventHandler): () => void;
  dispatch(topic: string): Promise<void>;
  listPublished(): EventEnvelope[];
  listDeadLetters(): DeadLetterEvent[];
};

function cloneEvent(event: EventEnvelope): EventEnvelope {
  return { ...event, payload: { ...event.payload } };
}

function toDeadLetter(envelope: EventEnvelope, retry: EventRetryMetadata): DeadLetterEvent {
  return {
    id: `dlq-${envelope.id}`,
    eventId: envelope.id,
    ticketId: envelope.ticketId,
    topic: envelope.topic,
    reason: retry.lastError ?? "Event handler failed.",
    retryCount: retry.attempt,
    failedAt: new Date().toISOString(),
    nextAction: "Inspect handler failure and replay once the consumer is fixed.",
  };
}

export function createInMemoryEventBus(seedEvents: EventEnvelope[] = eventEnvelopes): EventBus {
  const published = seedEvents.map(cloneEvent);
  const deadLetters = deadLetterEvents.map((event) => ({ ...event }));
  const handlers = new Map<string, Set<EventHandler>>();
  const deliveredKeys = new Set<string>();

  return {
    async publish(envelope) {
      const duplicate = published.some((event) => event.idempotencyKey === envelope.idempotencyKey);
      if (!duplicate) published.push(cloneEvent(envelope));
      return { accepted: true, duplicate, envelope: cloneEvent(envelope) };
    },

    subscribe(topic, handler) {
      const topicHandlers = handlers.get(topic) ?? new Set<EventHandler>();
      topicHandlers.add(handler);
      handlers.set(topic, topicHandlers);
      return () => {
        topicHandlers.delete(handler);
      };
    },

    async dispatch(topic) {
      const topicHandlers = handlers.get(topic);
      if (!topicHandlers?.size) return;

      for (const envelope of published.filter((event) => event.topic === topic)) {
        const dispatchKey = `${topic}:${envelope.idempotencyKey}`;
        if (deliveredKeys.has(dispatchKey)) continue;

        for (const handler of topicHandlers) {
          try {
            await handler(cloneEvent(envelope));
            deliveredKeys.add(dispatchKey);
          } catch (error) {
            deadLetters.push(
              toDeadLetter(envelope, {
                attempt: 1,
                maxAttempts: 3,
                lastError: error instanceof Error ? error.message : "Unknown handler error.",
              }),
            );
          }
        }
      }
    },

    listPublished() {
      return published.map(cloneEvent);
    },

    listDeadLetters() {
      return deadLetters.map((event) => ({ ...event }));
    },
  };
}

export function createEventBus(config: RuntimeConfig = getRuntimeConfig()): EventBus {
  if (config.mode === "demo") return createInMemoryEventBus();
  if (!config.redpandaBrokers) {
    throw new Error(`OPS_DESK_MODE=${config.mode} event bus requires REDPANDA_BROKERS for the Redpanda adapter.`);
  }
  throw new Error("Redpanda event bus adapter is configured but not implemented in this demo phase.");
}
