/**
 * 键盘管理器门面
 * 提供了一个简单的静态接口来访问键盘管理功能
 */
import { BaseFacade } from '@coffic/cosy';

class KeyFacade extends BaseFacade {
    public getFacadeAccessor(): string {
        return 'key';
    }
}

export const Key = KeyFacade; 