/**
 * Stack 驱动实现
 * 支持将多个日志通道组合在一起
 */
import {
  ILogDriver,
  ILogChannel,
  ILogChannelConfig,
  ILogLevel,
  ILogContext,
} from '@coffic/cosy-framework';

export class StackChannel implements ILogChannel {
  protected channels: ILogChannel[];
  protected name: string;

  constructor(name: string, channels: ILogChannel[]) {
    this.name = name;
    this.channels = channels;
  }

  emergency(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.EMERGENCY, message, context);
  }

  alert(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.ALERT, message, context);
  }

  critical(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.CRITICAL, message, context);
  }

  error(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.ERROR, message, context);
  }

  warning(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.WARNING, message, context);
  }

  warn(message: string, context?: ILogContext | undefined): void {
    this.warning(message, context);
  }

  notice(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.NOTICE, message, context);
  }

  info(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.INFO, message, context);
  }

  debug(message: string, context?: ILogContext | undefined): void {
    this.log(ILogLevel.DEBUG, message, context);
  }

  log(level: ILogLevel, message: string, context?: ILogContext): void {
    // 将日志同时发送到所有通道
    this.channels.forEach((channel) => {
      try {
        channel.log(level, message, context);
      } catch (error) {
        // 如果某个通道出错，不影响其他通道
        console.error(`Stack channel error in ${this.name}:`, error);
      }
    });
  }
}

export class StackDriver implements ILogDriver {
  constructor(private channelResolver: (name: string) => ILogChannel | null) {}

  createChannel(config: ILogChannelConfig): ILogChannel {
    const channels: ILogChannel[] = [];

    if (config.channels) {
      for (const channelName of config.channels) {
        const channel = this.channelResolver(channelName);
        if (channel) {
          channels.push(channel);
        } else {
          console.warn(`Stack driver: channel '${channelName}' not found`);
        }
      }
    }

    return new StackChannel(config.name || 'stack', channels);
  }
}
