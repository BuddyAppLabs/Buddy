import { ActionResult, SuperContext } from '@coffic/buddy-it';

export default {
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