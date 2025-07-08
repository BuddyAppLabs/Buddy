import { ActionResult, SuperContext } from '@coffic/buddy-it';

export default {
  id: 'current_version',
  description: '当前版本',
  async run(context: SuperContext): Promise<ActionResult> {
    return {
      success: true,
      message: `当前版本：${context.version.getCurrentVersion()}`,
    };
  },
};
