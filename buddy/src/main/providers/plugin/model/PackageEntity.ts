import { readPackageJson, hasPackageJson } from '../util/PackageUtils.js';
import { PluginType, ValidationResult } from '@coffic/buddy-types';
import { PluginEntity } from './PluginEntity.js';
import { PackageJson } from '@/types/package-json.js';
import { SendablePlugin } from '@/types/sendable-plugin.js';
// const logger = console;

const verbose = false;

/**
 * 插件包实体类
 * 用于管理插件包的所有相关信息，包括基本信息、路径、状态等
 * @property {string} path - The path to the package.
 * @property {string} name - The name of the package.
 * @property {string} description - The description of the package.
 * @property {string} version - The version of the package.
 * @property {string} author - The author of the package.
 * @property {string} main - The main entry point of the package.
 * @property {ValidationResult | null} validation - The validation result of the package.
 * @property {PluginType} type - The type of the package.
 * @property {PackageJson | undefined} packageJson - The package.json of the package.
 * @property {string} id - The id of the package.
 */
export class PackageEntity {
  path: string;
  name: string;
  description: string;
  version: string;
  author: string;
  main: string;
  validation?: ValidationResult | null;
  type: PluginType;
  packageJson?: PackageJson;
  id: string;

  constructor(path: string, pluginType: PluginType, packageJson?: PackageJson) {
    this.path = path;
    this.packageJson = packageJson;
    this.name = packageJson?.name || '';
    this.description = packageJson?.description || '';
    this.version = packageJson?.version || '';
    this.author = packageJson?.author || '';
    this.main = packageJson?.main || '';
    this.type = pluginType;
    this.validation = null;
    this.id = packageJson?.name || '';
  }

  /**
   * 从目录创建包实体
   * @param pluginPath 插件目录路径
   * @param type 插件类型
   */
  public static async fromDirectory(
    path: string,
    type: PluginType
  ): Promise<PackageEntity> {
    if (!(await hasPackageJson(path))) {
      throw new Error(`目录 ${path} 缺少 package.json`);
    }

    if (verbose) {
      // LogFacade.channel('plugin').info('[PackageEntity] 💼 读取插件包目录', {
      //   path,
      //   type,
      // });
    }

    const packageJson = await readPackageJson(path);
    const packageEntity = new PackageEntity(path, type, packageJson);

    return packageEntity;
  }

  /**
   * 从NPM包信息创建实体
   * @param npmPackage NPM包信息
   * @returns 实体
   */
  public static fromNpmPackage(
    npmPackage: PackageJson,
    pluginType: PluginType
  ): PackageEntity {
    const packageEntity = new PackageEntity(
      npmPackage.name,
      pluginType,
      npmPackage
    );
    return packageEntity;
  }

  /**
   * 获取插件实体
   * @returns 插件实体
   */
  public getPlugin(): PluginEntity | null {
    if (!this.packageJson) {
      return null;
    }

    return PluginEntity.fromPackage(this.packageJson, this.type);
  }

  public async getSendablePlugin(): Promise<SendablePlugin | null> {
    return this.getPlugin()?.getSendablePlugin() || null;
  }
}
