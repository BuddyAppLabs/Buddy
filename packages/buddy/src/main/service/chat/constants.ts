import { IProvider, ProviderType } from './contract/IProvider';

export const PROVIDERS: IProvider[] = [
  {
    type: ProviderType.DEEPSEEK,
    name: 'DeepSeek',
    apiKey: '',
    url: 'https://platform.deepseek.com/api_keys',
    description: 'DeepSeek 提供高性价比的中文优化模型',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        provider: ProviderType.DEEPSEEK,
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        provider: ProviderType.DEEPSEEK,
      },
    ],
  },
  {
    type: ProviderType.OPENAI,
    name: 'OpenAI',
    apiKey: '',
    url: 'https://platform.openai.com/api-keys',
    description: 'OpenAI 提供 GPT-4、GPT-3.5 等先进的语言模型',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4O',
        provider: ProviderType.OPENAI,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4O Mini',
        provider: ProviderType.OPENAI,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: ProviderType.OPENAI,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: ProviderType.OPENAI,
      },
    ],
  },
  {
    type: ProviderType.ANTHROPIC,
    name: 'Anthropic',
    apiKey: '',
    url: 'https://console.anthropic.com/settings/keys',
    description: 'Anthropic 提供 Claude 系列模型，擅长长文本处理',
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: ProviderType.ANTHROPIC,
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: ProviderType.ANTHROPIC,
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: ProviderType.ANTHROPIC,
      },
    ],
  },
];
