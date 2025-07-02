import express from 'express';
import cors from 'cors';
import { tool } from 'ai';
import { z } from 'zod';
import { IAIServerConfig } from './IAIServerConfig.js';
import { ChatService } from '@/main/service/chat/ChatService.js';

export class AIServer {
  private app = express();
  private serverInstance: any = null;
  private config: IAIServerConfig;
  private chatService: ChatService;

  constructor(config: IAIServerConfig) {
    this.setupMiddleware();
    this.setupRoutes();
    this.config = config;
    this.chatService = new ChatService(
      undefined,
      '你是AI助手，请根据用户的问题给出回答',
      this.config.logger
    );
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private get tools() {
    const weatherTool = tool({
      description: '获取指定城市的天气信息',
      parameters: z.object({
        location: z.string().describe('城市名称，如：北京、上海、广州'),
      }),
      execute: async ({ location }) => {
        const weatherData = {
          北京: {
            temperature: 15,
            condition: '晴朗',
            humidity: 45,
            windSpeed: 12,
          },
          上海: {
            temperature: 22,
            condition: '多云',
            humidity: 60,
            windSpeed: 8,
          },
          广州: {
            temperature: 28,
            condition: '小雨',
            humidity: 75,
            windSpeed: 6,
          },
          深圳: {
            temperature: 26,
            condition: '阴天',
            humidity: 68,
            windSpeed: 10,
          },
          杭州: {
            temperature: 18,
            condition: '多云',
            humidity: 55,
            windSpeed: 15,
          },
        };
        const weather = weatherData[location] || {
          temperature: Math.floor(Math.random() * 30) + 5,
          condition: ['晴朗', '多云', '小雨', '阴天'][
            Math.floor(Math.random() * 4)
          ],
          humidity: Math.floor(Math.random() * 50) + 30,
          windSpeed: Math.floor(Math.random() * 20) + 5,
        };
        return {
          location,
          ...weather,
          timestamp: new Date().toISOString(),
        };
      },
    });

    const locationTool = tool({
      description: '获取指定地点的详细位置信息',
      parameters: z.object({
        query: z.string().describe('位置查询关键词'),
      }),
      execute: async ({ query }) => {
        const locationData = {
          北京: {
            name: '北京',
            country: '中国',
            region: '北京市',
            lat: 39.9042,
            lon: 116.4074,
            timezone: 'Asia/Shanghai',
          },
          上海: {
            name: '上海',
            country: '中国',
            region: '上海市',
            lat: 31.2304,
            lon: 121.4737,
            timezone: 'Asia/Shanghai',
          },
          广州: {
            name: '广州',
            country: '中国',
            region: '广东省',
            lat: 23.1291,
            lon: 113.2644,
            timezone: 'Asia/Shanghai',
          },
          深圳: {
            name: '深圳',
            country: '中国',
            region: '广东省',
            lat: 22.5431,
            lon: 114.0579,
            timezone: 'Asia/Shanghai',
          },
        };
        const location = locationData[query] || {
          name: query,
          country: '中国',
          region: '未知地区',
          lat: Math.random() * 60 + 20,
          lon: Math.random() * 120 + 70,
          timezone: 'Asia/Shanghai',
        };
        return location;
      },
    });

    return {
      getWeather: weatherTool,
      getLocation: locationTool,
    };
  }

  private setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    this.app.get('/api/models', (req, res) => {
      res.json({
        data: this.chatService.getModelList(),
      });
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

      const response = this.chatService.createStream(model, '', messages);
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
        this.config.logger.info(
          `🤖 Chat endpoint: http://localhost:${this.config.port}/api/chat/completions`
        );
        this.config.logger.info(
          `📋 Models endpoint: http://localhost:${this.config.port}/api/models`
        );
      });
    }
  }

  public getApp() {
    return this.app;
  }
}
