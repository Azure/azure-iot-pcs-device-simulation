export const logEventRequestModel = (request = {}) => ({
    EventType: request.eventType,
    EventProperties: request.eventProperties
  });
  