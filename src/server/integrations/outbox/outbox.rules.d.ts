export function retryDelayMilliseconds(attempts: number): number;

export function unsupportedEventResult(type: string): {
  status: "cancelled";
  reason: string;
};
