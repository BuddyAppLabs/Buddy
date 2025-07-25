import { IProvider, ProviderType } from './contract/IProvider';

export const PROVIDERS: IProvider[] = [
  {
    type: ProviderType.DEEPSEEK,
    apiKey: '',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        provider: ProviderType.DEEPSEEK,
      },
    ],
  },
  {
    type: ProviderType.OPENAI,
    apiKey: '',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4O',
        provider: ProviderType.OPENAI,
      },
    ],
  },
  {
    type: ProviderType.ANTHROPIC,
    apiKey: '',
    models: [
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: ProviderType.ANTHROPIC,
      },
    ],
  },
];
