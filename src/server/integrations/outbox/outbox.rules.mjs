export function retryDelayMilliseconds(attempts) {
  const seconds = Math.min(60 * 2 ** Math.max(attempts - 1, 0), 3600);
  return seconds * 1000;
}

export function unsupportedEventResult(type) {
  return {
    status: "cancelled",
    reason: `Unsupported integration event type: ${type}`,
  };
}
