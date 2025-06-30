/**
 * 参数验证器
 * 提供路由参数的验证功能，类似Laravel的Validator
 */

import {
  IValidationRule,
  IValidationRules,
} from '../contract/router/IValidation';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class Validator {
  /**
   * 验证参数
   */
  validate(args: any[], rules: IValidationRules): ValidationResult {
    const errors: string[] = [];

    // 检查每个规则
    for (const [paramName, rule] of Object.entries(rules)) {
      const paramIndex = parseInt(paramName);
      const value = isNaN(paramIndex) ? undefined : args[paramIndex];

      const error = this.validateParam(paramName, value, rule);
      if (error) {
        errors.push(error);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证单个参数
   */
  private validateParam(
    paramName: string,
    value: any,
    rule: IValidationRule
  ): string | null {
    // 检查必填
    if (rule.required && (value === undefined || value === null)) {
      return `参数 ${paramName} 是必填的`;
    }

    // 如果值为空且不是必填，跳过其他验证
    if (value === undefined || value === null) {
      return null;
    }

    // 检查类型
    if (rule.type) {
      const typeError = this.validateType(paramName, value, rule.type);
      if (typeError) {
        return typeError;
      }
    }

    // 自定义验证器
    if (rule.validator) {
      const result = rule.validator(value);
      if (typeof result === 'string') {
        return `参数 ${paramName} 验证失败: ${result}`;
      }
      if (!result) {
        return `参数 ${paramName} 验证失败`;
      }
    }

    return null;
  }

  /**
   * 验证参数类型
   */
  private validateType(
    paramName: string,
    value: any,
    expectedType: string
  ): string | null {
    const actualType = this.getValueType(value);

    if (actualType !== expectedType) {
      return `参数 ${paramName} 类型错误，期望 ${expectedType}，实际 ${actualType}`;
    }

    return null;
  }

  /**
   * 获取值的类型
   */
  private getValueType(value: any): string {
    if (Array.isArray(value)) {
      return 'array';
    }

    if (value === null) {
      return 'null';
    }

    const type = typeof value;
    return type === 'object' ? 'object' : type;
  }

  /**
   * 静态方法：快速验证
   */
  static validate(args: any[], rules: IValidationRules): ValidationResult {
    const validator = new Validator();
    return validator.validate(args, rules);
  }
}
