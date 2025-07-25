import { readPackageJson, hasPackageJson } from '../util/PackageUtils.js';
import { PluginType, ValidationResult } from '@coffic/buddy-it';
import { PluginEntity } from './PluginEntity.js';
import { PackageJson } from '@/types/package-json.js';
import { ILogManager, LogFacade } from '@coffic/cosy-framework';
import { SendablePackage } from '@/types/sendable-package.js';

interface PackageOptions {
  path?: string;
  url?: string;
  type: PluginType;
  packageJson?: PackageJson;
  logger?: ILogManager;
  error?: string;
}

/**
 * 插件包实体类
 * 用于管理插件包的所有相关信息，包括基本信息、路径、状态等
 * 相对于插件实体类，更轻量
 */
export class PackageEntity {
  path?: string;
  url?: string;
  name: string;
  description: string;
  version: string;
  author: string;
  main: string;
  validation?: ValidationResult | null;
  type: PluginType;
  packageJson?: PackageJson;
  id: string;
  logger?: ILogManager;
  error?: string;

  constructor({ path, url, type, packageJson, logger, error }: PackageOptions) {
    this.path = path;
    this.packageJson = packageJson;
    this.name = packageJson?.name || '';
    this.description = packageJson?.description || '';
    this.version = packageJson?.version || '';
    this.author = packageJson?.author || '';
    this.main = packageJson?.main || '';
    this.type = type;
    this.url = url;
    this.validation = null;
    this.id = packageJson?.name || '';
    this.logger = logger;
    this.error = error;
  }

  /**
   * 从目录创建包实体
   */
  public static async fromDirectory(
    path: string,
    type: PluginType
  ): Promise<PackageEntity> {
    LogFacade.channel('plugin').debug(`[PackageEntity] 从目录创建包实体`, {
      path,
      type,
    });

    if (!(await hasPackageJson(path))) {
      LogFacade.channel('plugin').warn(
        `[PackageEntity] 目录 ${path} 缺少 package.json`,
        { error: `目录 ${path} 缺少 package.json` }
      );
      return new PackageEntity({
        path,
        type,
        packageJson: undefined,
        error: `目录 ${path} 缺少 package.json`,
      });
    }

    const packageJson = await readPackageJson(path);
    const packageEntity = new PackageEntity({
      path,
      type,
      packageJson,
    });

    LogFacade.channel('plugin').debug(`[PackageEntity] 创建成功`, {
      path,
      packageJson,
    });

    return packageEntity;
  }

  /**
   * 从NPM包信息创建实体
   */
  public static fromPackageJSON(
    npmPackage: PackageJson,
    pluginType: PluginType
  ): PackageEntity {
    return new PackageEntity({
      type: pluginType,
      packageJson: npmPackage,
    });
  }

  /**
   * 获取插件实体
   */
  public toPlugin(): PluginEntity | null {
    if (!this.packageJson) {
      LogFacade.channel('plugin').warn(`[PackageEntity] 插件包信息不存在`, {
        error: `插件包信息不存在`,
      });
      return null;
    }

    if (!this.path) {
      LogFacade.channel('plugin').warn(`[PackageEntity] 插件路径不存在`, {
        error: `插件路径不存在`,
      });
      return null;
    }

    return new PluginEntity(this.packageJson, this.path, this.type);
  }

  public toSendablePackage(): SendablePackage {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      main: this.main,
      path: this.path || '',
      type: this.type,
      error: this.error,
    };
  }
}
