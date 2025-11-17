import { PROVIDER_CONFIG, type ProviderName } from '../types';
import type { ModelResult, ProviderResult } from '../types';

export function getModel(
  provider: ProviderName,
  modelName: string,
  key: string
): ModelResult {
  const ProviderClass = PROVIDER_CONFIG[provider];
  if (!ProviderClass) {
    throw new Error('Unsupported AI provider.');
  }
  return new ProviderClass().getModel(modelName, key);
}

export function getAllProvidersWithModels(): ProviderResult[] {
  const result = Object.entries(PROVIDER_CONFIG).map(
    ([provider, ProviderClass]) => {
      const models = new ProviderClass().getModels();
      return {
        provider_name: provider as ProviderName,
        models,
      };
    }
  );
  return result;
}
