export interface ICacheRepo {
  has(key: string): Promise<boolean>;
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl: number): Promise<void>;
}
