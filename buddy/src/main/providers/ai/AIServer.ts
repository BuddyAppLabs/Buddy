import express from 'express';
import cors from 'cors';
import { IAIServerConfig } from './IAIServerConfig.js';
import { ChatService } from '@/main/service/chat/ChatService.js';
import { IAIManager } from './IAIManager.js';
import { AIManager } from './AIManager.js';

export class AIServer {
  private app = express();
  private serverInstance: any = null;
  private config: IAIServerConfig;
  private chatService: ChatService;
  private aiManager: IAIManager;

  constructor(config: IAIServerConfig) {
    this.setupMiddleware();
    this.setupRoutes();
    this.config = config;
    this.chatService = new ChatService(
      undefined,
      '你是AI助手，请根据用户的问题给出回答',
      this.config.logger
    );
    this.aiManager = new AIManager();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    this.app.get('/api/models', (_req, res) => {
      res.json({
        data: this.chatService.getModelList(),
      });
    });

    // 设置供应商的key
    this.app.post('/api/providers/:provider/keys', async (req, res) => {
      const provider = req.params.provider;
      const { key } = req.body;
      if (!provider || !key) {
        return res.status(400).json({
          error: {
            message: 'Missing required parameters: provider and key',
            type: 'invalid_request_error',
          },
        });
      }
      await this.aiManager.setApiKey(provider, key);
      res.json({ message: 'Key set successfully' });
    });

    this.app.post('/api/chat/completions', async (req, res) => {
      const { model, messages } = req.body;
      if (!model || !messages) {
        return res.status(400).json({
          error: {
            message: 'Missing required parameters: model and messages',
            type: 'invalid_request_error',
          },
        });
      }

      const modelApiKey = await this.aiManager.getModelApiKey(model);
      if (!modelApiKey) {
        return res.status(400).json({
          error: {
            message: 'Model not found',
            type: 'invalid_request_error',
          },
        });
      }

      const response = this.chatService.createStream(
        model,
        modelApiKey,
        messages
      );
      response.pipeDataStreamToResponse(res);
    });
  }

  public start() {
    if (!this.serverInstance) {
      this.serverInstance = this.app.listen(this.config.port, () => {
        this.config.logger.info(
          `🚀 AI Chat API Server running on port ${this.config.port}`
        );
        this.config.logger.info(
          `📍 Health check: http://localhost:${this.config.port}/health`
        );
      });
    }
  }

  public getApp() {
    return this.app;
  }
}
