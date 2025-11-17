import { IModel } from './IModel';

export enum ProviderType {
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export interface IProvider {
  type: ProviderType;
  name?: string; // 显示名称
  apiKey: string;
  models: IModel[];
  url?: string; // 获取API密钥的URL
  description?: string; // 供应商描述
}
