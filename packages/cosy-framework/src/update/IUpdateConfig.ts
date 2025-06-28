export const UpdateContract = 'update';

export interface IUpdateConfig {
  allowDowngrade?: boolean;
  allowPrerelease?: boolean;
  forceDevUpdateConfig?: boolean;
  autoCheck?: boolean;
  autoCheckDelay?: number;
}
