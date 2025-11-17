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
  console.log(
    '[getAllProvidersWithModels] PROVIDER_CONFIG keys:',
    Object.keys(PROVIDER_CONFIG)
  );
  const result = Object.entries(PROVIDER_CONFIG).map(
    ([provider, ProviderClass]) => {
      console.log(
        `[getAllProvidersWithModels] Processing provider: ${provider}`
      );
      const models = new ProviderClass().getModels();
      console.log(
        `[getAllProvidersWithModels] ${provider} has ${models.length} models`
      );
      return {
        provider_name: provider as ProviderName,
        models,
      };
    }
  );
  console.log(
    '[getAllProvidersWithModels] Final result providers:',
    result.map((p) => p.provider_name)
  );
  return result;
}
