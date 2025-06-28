/**
 * 路由参数验证规则
 */
export interface IValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  validator?: (value: any) => boolean | string;
}

/**
 * 路由参数验证配置
 */
export type IValidationRules = Record<string, IValidationRule>;
