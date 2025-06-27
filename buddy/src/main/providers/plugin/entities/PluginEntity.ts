/**
 * 插件实体
 * 代表一个插件的所有信息
 */
import { join } from 'path';
import fs from 'fs';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface PluginMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    main?: string;
    path: string;
    validation?: ValidationResult | null;
    type: string;
    npmPackage?: string;
    pagePath?: string;
}

export class PluginEntity implements PluginMetadata {
    public id: string;
    public name: string;
    public description: string;
    public version: string;
    public author: string;
    public main?: string;
    public path: string;
    public validation?: ValidationResult | null;
    public type: string;
    public npmPackage?: string;
    public pagePath?: string;

    constructor(metadata: PluginMetadata) {
        this.id = metadata.id;
        this.name = metadata.name;
        this.description = metadata.description;
        this.version = metadata.version;
        this.author = metadata.author;
        this.main = metadata.main;
        this.path = metadata.path;
        this.validation = metadata.validation;
        this.type = metadata.type;
        this.npmPackage = metadata.npmPackage;
        this.pagePath = metadata.pagePath;
    }

    /**
     * 从目录创建插件实体
     */
    public static async fromDir(pluginPath: string, type: string): Promise<PluginEntity> {
        const packageJsonPath = join(pluginPath, 'package.json');

        if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`插件目录缺少 package.json: ${pluginPath}`);
        }

        const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));

        return new PluginEntity({
            id: packageJson.name,
            name: packageJson.name,
            description: packageJson.description || '',
            version: packageJson.version,
            author: packageJson.author || '',
            main: packageJson.main,
            path: pluginPath,
            type: type,
            validation: {
                isValid: true,
                errors: []
            }
        });
    }

    /**
     * 获取可发送的插件信息
     */
    public async getSendablePlugin(): Promise<any> {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            version: this.version,
            author: this.author,
            type: this.type,
            npmPackage: this.npmPackage,
            pagePath: this.pagePath
        };
    }

    /**
     * 执行插件动作
     */
    public async executeAction(_actionId: string, _keyword: string): Promise<any> {
        // 这里需要实现具体的动作执行逻辑
        throw new Error('Not implemented');
    }
} 