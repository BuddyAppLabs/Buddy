import express from 'express';
import cors from 'cors';
import { IAIServerConfig } from './IAIServerConfig.js';
import { IAIManager } from './IAIManager.js';
import { createAIRouter } from './AIRouter.js';
import { ILogManager } from '@coffic/cosy-framework';

export class AIServer {
  app = express();
  private serverInstance: any = null;
  private config: IAIServerConfig;
  aiManager: IAIManager;
  logger: ILogManager;

  constructor(config: IAIServerConfig) {
    this.setupMiddleware();
    this.setupRoutes();
    this.config = config;
    this.aiManager = config.aiManager;
    this.logger = config.logger;
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    createAIRouter(this);
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
}
