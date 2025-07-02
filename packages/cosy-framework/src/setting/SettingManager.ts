import { ISettingManager } from '../contract/setting/ISettingManager';
import { promises as fs } from 'fs';
import * as path from 'path';
import { EMOJI } from '../constants.js';

export class SettingManager implements ISettingManager {
  private _settings: Map<string, any> = new Map();

  private debug: boolean;

  constructor(
    private readonly filePath: string,
    debug?: boolean
  ) {
    this.debug = debug || false;
  }

  public async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      this._settings = new Map(Object.entries(parsed));

      if (this.debug) {
        console.log(
          `${EMOJI} [SettingManager] loaded settings`,
          this._settings
        );
      }
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
    const value = this._settings.get(key);
    if (value === undefined) {
      console.log('get', key, 'not found, return default value', defaultValue);
      return defaultValue;
    }
    return value;
  }

  public async set(key: string, value: any): Promise<void> {
    this._settings.set(key, value);
    await this.save();
  }

  public has(key: string): boolean {
    return this._settings.has(key);
  }

  public async remove(key: string): Promise<void> {
    this._settings.delete(key);
    await this.save();
  }

  public all(): Record<string, any> {
    return Object.fromEntries(this._settings);
  }

  public getDirectoryPath(): string {
    return path.dirname(this.filePath);
  }
}
