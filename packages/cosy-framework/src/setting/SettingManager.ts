import { ISettingManager } from '../contract/setting/ISettingManager';
import { promises as fs } from 'fs';
import * as path from 'path';

export class SettingManager implements ISettingManager {
  private _settings: Map<string, any> = new Map();

  constructor(private readonly filePath: string) {}

  public async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      this._settings = new Map(Object.entries(parsed));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this._settings = new Map();
        return;
      }
      throw error;
    }
  }

  public async save(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dir, { recursive: true });
      } else {
        throw error;
      }
    }

    const data = JSON.stringify(Object.fromEntries(this._settings), null, 2);
    await fs.writeFile(this.filePath, data, 'utf-8');
  }

  public get(key: string, defaultValue?: any): any {
    return this._settings.has(key) ? this._settings.get(key) : defaultValue;
  }

  public async set(key: string, value: any): Promise<void> {
    this._settings.set(key, value);
    await this.save();
  }

  public has(key: string): boolean {
    return this._settings.has(key);
  }

  public all(): Record<string, any> {
    return Object.fromEntries(this._settings);
  }

  public getDirectoryPath(): string {
    return path.dirname(this.filePath);
  }
}
