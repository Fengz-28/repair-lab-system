export type DomainEvent = {
  type: string;
  aggregateType?: string;
  aggregateId?: string;
  payload: unknown;
  idempotencyKey?: string;
};

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
}

