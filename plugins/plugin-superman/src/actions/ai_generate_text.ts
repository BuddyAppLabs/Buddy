import { ActionResult, SuperContext } from '@coffic/buddy-it';

export const getAiGenerateTextAction = (context: SuperContext) => {
  if (context.keyword.length > 0) {
    return;
  }

  return {
    id: 'ai_generate_text',
    description: 'AI生成文本',
    icon: '🤖',
    async run(context: SuperContext): Promise<ActionResult> {
      const result = await context.ai.generateText('生成简短的问候语');
      return {
        success: true,
        message: result ? `成功` : '没有结果',
        alert: result,
      };
    },
  };
};
