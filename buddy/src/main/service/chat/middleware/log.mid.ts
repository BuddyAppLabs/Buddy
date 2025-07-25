import type { LanguageModelV1Middleware, LanguageModelV1StreamPart } from 'ai';
import { IChatLogger } from '../contract/IChatLogger';

export function createLogMiddleware(
  logger: IChatLogger | null,
  logRequest: boolean = false,
  logResponse: boolean = false
): LanguageModelV1Middleware {
  return {
    wrapGenerate: async ({ doGenerate, params }) => {
      logger?.info('doGenerate called');
      if (logRequest) {
        logger?.info(`params: ${JSON.stringify(params, null, 2)}`);
      }

      const result = await doGenerate();

      logger?.info('doGenerate finished');
      if (logResponse) {
        logger?.info(`generated text: ${result.text}`);
      }

      return result;
    },

    wrapStream: async ({ doStream, params }) => {
      logger?.info('doStream called');
      if (logRequest) {
        logger?.info(`params: ${JSON.stringify(params, null, 2)}`);
      }

      const { stream, ...rest } = await doStream();

      let generatedText = '';

      const transformStream = new TransformStream<
        LanguageModelV1StreamPart,
        LanguageModelV1StreamPart
      >({
        transform(chunk, controller) {
          if (chunk.type === 'text-delta') {
            generatedText += chunk.textDelta;
          }

          controller.enqueue(chunk);
        },

        flush() {
          logger?.info('doStream finished');
          if (logResponse) {
            logger?.info(`generated text: ${generatedText}`);
          }
        },
      });

      return {
        stream: stream.pipeThrough(transformStream),
        ...rest,
      };
    },
  };
}
