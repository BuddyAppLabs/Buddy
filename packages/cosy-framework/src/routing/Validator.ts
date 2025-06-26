/**
 * 路由验证器
 * 提供参数验证功能
 */

import { ValidationRules } from './types.js';

export class Validator {
    /**
     * 验证请求参数
     */
    validate(args: any[], rules: ValidationRules): { valid: boolean; error?: string } {
        for (const [param, rule] of Object.entries(rules)) {
            const index = parseInt(param);
            const value = args[index];

            // 必填检查
            if (rule.required && (value === undefined || value === null)) {
                return { valid: false, error: `Parameter ${param} is required` };
            }

            // 类型检查
            if (rule.type && value !== undefined && typeof value !== rule.type) {
                return { valid: false, error: `Parameter ${param} must be of type ${rule.type}` };
            }

            // 自定义验证
            if (rule.validator && value !== undefined) {
                const result = rule.validator(value);
                if (result !== true) {
                    return { valid: false, error: typeof result === 'string' ? result : `Validation failed for parameter ${param}` };
                }
            }
        }

        return { valid: true };
    }
}