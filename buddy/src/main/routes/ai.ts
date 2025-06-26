/**
 * AI相关路由
 * 处理AI聊天和流式通信
 */

import { AI, Route } from '@coffic/buddy-foundation';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, IpcResponse, StreamChunkResponse } from '@coffic/buddy-types';
import { IPC_METHODS } from '@/types/ipc-methods.js';

const logger = console;

// 启动流式AI聊天会话
Route.handle(IPC_METHODS.AI_CHAT_SEND, async (event, messages: ChatMessage[]): Promise<IpcResponse<string>> => {
    logger.debug(`启动流式AI聊天: ${messages.length}条消息`);
    try {
        const requestId = uuidv4();
        logger.debug(`生成请求ID: ${requestId}`);

        AI.sendChatMessage(messages,
            (chunk: string) => {
                logger.debug(`聊天数据块: ${chunk}`);
                event.sender.send(IPC_METHODS.AI_CHAT_STREAM_CHUNK, {
                    success: true,
                    data: chunk,
                    requestId
                } as StreamChunkResponse);
            },
            () => {
                logger.debug(`聊天完成`);
                event.sender.send(IPC_METHODS.AI_CHAT_STREAM_DONE, {
                    success: true,
                    requestId
                });
            },
            undefined,
            requestId
        );

        return {
            success: true,
            data: requestId
        };
    } catch (error) {
        logger.error(`启动流式AI聊天失败:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
})
    .validation({
        '0': {
            required: true,
            type: 'array',
            validator: (messages) => {
                return Array.isArray(messages) && messages.length > 0 ? true : '消息列表不能为空';
            }
        }
    })
    .description('启动流式AI聊天会话');

// 取消AI聊天请求
Route.handle(IPC_METHODS.AI_CHAT_CANCEL, (_event, requestId: string, reason: string): IpcResponse<boolean> => {
    logger.debug(`取消AI聊天请求: ${requestId}，原因是：${reason}`);
    try {
        const cancelled = AI.cancelRequest(requestId);
        return { success: true, data: cancelled };
    } catch (error) {
        logger.error(`取消AI聊天请求失败:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
})
    .validation({
        '0': { required: true, type: 'string' },
        '1': { required: true, type: 'string' }
    })
    .description('取消AI聊天请求'); 