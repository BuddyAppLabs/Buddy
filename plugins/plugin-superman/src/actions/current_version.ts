import { ActionResult, SuperContext } from '@coffic/buddy-it';

export const getCurrentVersionAction = (context: SuperContext) => {
  if (
    context.keyword.startsWith('version') ||
    context.keyword.startsWith('版本')
  ) {
    return {
      id: 'current_version',
      description: '当前版本',
      async run(context: SuperContext): Promise<ActionResult> {
        return {
          success: true,
          message: `当前版本：${context.version.getCurrentVersion()}`,
        };
      },
    };
  }
  return null;
};
