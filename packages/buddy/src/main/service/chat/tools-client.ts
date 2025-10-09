import { getLocation } from './tools-client/location';

export function clientToolCall(toolName: string) {
  if (toolName === 'getLocation') {
    return getLocation();
  }

  return null;
}
