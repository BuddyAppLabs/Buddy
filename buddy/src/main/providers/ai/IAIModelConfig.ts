import { AIModelType } from './IAIManager';

// AI模型配置
export interface IAIModelConfig {
  type: AIModelType;
  modelName: string;
  apiKey: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}
