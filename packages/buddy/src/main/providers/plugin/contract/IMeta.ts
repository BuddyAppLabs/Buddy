import { IValidationResult } from './IValidationResult';

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  main?: string;
  path: string;
  validation?: IValidationResult | null;
  type: string;
  npmPackage?: string;
  pagePath?: string;
}
