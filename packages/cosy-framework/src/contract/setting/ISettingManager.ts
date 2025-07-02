export interface ISettingManager {
  /**
   * Get a setting value.
   *
   * @param key The key of the setting.
   * @param defaultValue The default value to return if the key does not exist.
   */
  get<T>(key: string, defaultValue: T): T;

  /**
   * Get a setting value.
   *
   * @param key The key of the setting.
   */
  get<T = any>(key: string): T | undefined;

  /**
   * Set a setting value.
   *
   * @param key
   * @param value
   */
  set(key: string, value: any): Promise<void>;

  /**
   * Check if a setting exists.
   *
   * @param key
   */
  has(key: string): boolean;

  /**
   * Remove a setting value.
   *
   * @param key
   */
  remove(key: string): Promise<void>;

  /**
   * Get all settings.
   */
  all(): Record<string, any>;

  /**
   * Load settings from persistence.
   */
  load(): Promise<void>;

  /**
   * Save settings to persistence.
   */
  save(): Promise<void>;

  /**
   * Get the directory path of the settings file.
   */
  getDirectoryPath(): string;
}
