import { AIServer } from './AIServer';

export function createAIRouter(server: AIServer) {
  server.app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // 测试流式响应端点
  server.app.get('/api/test/stream', (_req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let count = 0;
    const interval = setInterval(() => {
      count++;
      res.write(`data: Message ${count}\n\n`);

      if (count >= 5) {
        clearInterval(interval);
        res.end();
      }
    }, 1000);
  });

  // 获取支持的供应商列表
  server.app.get('/api/providers', (_req, res) => {
    res.json({ data: server.aiManager.getAvailableProviders() });
  });

  // 获取支持的模型列表
  server.app.get('/api/models', (_req, res) => {
    res.json({ data: server.aiManager.getAvailableModels() });
  });

  // 设置供应商的key
  server.app.post('/api/providers/:provider/keys', async (req, res) => {
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
    await server.aiManager.setApiKey(provider, key);
    res.json({ message: 'Key set successfully' });
  });

  // 创建聊天流
  server.app.post('/api/chat/completions', async (req, res) => {
    const { model, messages } = req.body;
    if (!model || !messages) {
      return res.status(400).json({
        error: {
          message: 'Missing required parameters: model and messages',
          type: 'invalid_request_error',
        },
      });
    }

    try {
      const response = await server.aiManager.createStream(model, messages);
      response.pipeDataStreamToResponse(res);
    } catch (error) {
      server.logger.error('[AIRouter] Error creating stream', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        error: {
          message: 'Internal server error',
          type: 'internal_error',
        },
      });
    }
  });
}
