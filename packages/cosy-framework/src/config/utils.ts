/**
 * Buddy Foundation 配置系统工具函数
 * 提供配置操作的辅助功能
 */

import { ConfigValue, ConfigObject } from './types.js';

/**
 * 使用点记法获取嵌套对象的值
 * @param obj 目标对象
 * @param path 点记法路径，如 'app.name'
 * @param defaultValue 默认值
 */
export function get<T = ConfigValue>(
  obj: ConfigObject,
  path: string,
  defaultValue?: T
): T {
  if (!path) {
    return (obj as T) ?? defaultValue!;
  }

  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return defaultValue!;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue!;
}

/**
 * 使用点记法设置嵌套对象的值
 * @param obj 目标对象
 * @param path 点记法路径，如 'app.name'
 * @param value 要设置的值
 */
export function set(obj: ConfigObject, path: string, value: ConfigValue): void {
  if (!path) {
    throw new Error('配置路径不能为空');
  }

  const keys = path.split('.');
  let current: any = obj;

  // 遍历到倒数第二级
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key];
  }

  // 设置最终值
  current[keys[keys.length - 1]] = value;
}

/**
 * 检查配置路径是否存在
 * @param obj 目标对象
 * @param path 点记法路径
 */
export function has(obj: ConfigObject, path: string): boolean {
  if (!path) {
    return false;
  }

  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object' ||
      !(key in current)
    ) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * 深度合并配置对象
 * @param target 目标对象
 * @param source 源对象
 */
export function mergeConfig(
  target: ConfigObject,
  source: ConfigObject
): ConfigObject {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = mergeConfig(
        targetValue as ConfigObject,
        sourceValue as ConfigObject
      );
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * 检查是否为普通对象（非数组、非null、非函数等）
 * @param value 待检查的值
 */
export function isPlainObject(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value !== 'function' &&
    !(value instanceof Date) &&
    !(value instanceof RegExp)
  );
}

/**
 * 展开配置对象为点记法键值对
 * @param obj 配置对象
 * @param prefix 前缀
 */
export function flatten(
  obj: ConfigObject,
  prefix = ''
): Record<string, ConfigValue> {
  const result: Record<string, ConfigValue> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      Object.assign(result, flatten(value as ConfigObject, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * 从点记法键值对重建配置对象
 * @param flattened 展开的配置对象
 */
export function unflatten(
  flattened: Record<string, ConfigValue>
): ConfigObject {
  const result: ConfigObject = {};

  for (const key in flattened) {
    set(result, key, flattened[key]);
  }

  return result;
}

/**
 * 验证配置值类型
 * @param value 配置值
 * @param expectedType 期望类型
 */
export function validateConfigType(
  value: ConfigValue,
  expectedType: string
): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return isPlainObject(value);
    case 'array':
      return Array.isArray(value);
    default:
      return true; // 未知类型，通过验证
  }
}

/**
 * 克隆配置对象
 * @param config 配置对象
 */
export function cloneConfig<T extends ConfigObject>(config: T): T {
  if (config === null || typeof config !== 'object') {
    return config;
  }

  const newConfig: { [key: string]: any } = Array.isArray(config) ? [] : {};

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      const value = config[key];
      if (typeof value === 'function') {
        newConfig[key] = value;
      } else if (value !== null && typeof value === 'object') {
        // 递归地克隆嵌套对象
        newConfig[key] = cloneConfig(value as ConfigObject);
      } else {
        newConfig[key] = value;
      }
    }
  }

  return newConfig as T;
}

/**
 * 生成配置缓存键
 * @param configPath 配置路径
 * @param version 版本号
 */
export function generateCacheKey(configPath: string, version?: string): string {
  const base = configPath.replace(/[/\\:]/g, '_');
  return version ? `${base}_${version}` : base;
}

/**
 * 解析环境变量值
 * @param value 环境变量值
 */
export function parseEnvValue(value: string): ConfigValue {
  // 布尔值
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // null
  if (value.toLowerCase() === 'null') return null;

  // undefined
  if (value.toLowerCase() === 'undefined') return undefined;

  // 数字
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);

  // JSON
  if (
    (value.startsWith('{') && value.endsWith('}')) ||
    (value.startsWith('[') && value.endsWith(']'))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      // 解析失败，返回原字符串
    }
  }

  return value;
}
