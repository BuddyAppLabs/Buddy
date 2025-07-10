import { getAiGenerateTextAction } from './ai_generate_text';
import { getSetAiProviderKeyDeepseekAction } from './set_ai_provider_key_deepseek';
import { getTimeAction } from './time';
import { getCalculateAction } from './calculate';
import { getOpenConfigAction } from './open_config';
import { getOpenLogsAction } from './open_logs';
import { getCurrentVersionAction } from './current_version';
import { SuperContext } from '@coffic/buddy-it';
import { getHelloAction } from './hello';

export const getActions = (context: SuperContext) => {
  const actions = [];

  const hello = getHelloAction(context);
  if (hello) {
    actions.push(hello);
  }

  const ai_generate_text = getAiGenerateTextAction(context);
  if (ai_generate_text) {
    actions.push(ai_generate_text);
  }

  const set_ai_provider_key_deepseek =
    getSetAiProviderKeyDeepseekAction(context);
  if (set_ai_provider_key_deepseek) {
    actions.push(set_ai_provider_key_deepseek);
  }

  const time = getTimeAction(context);
  if (time) {
    actions.push(time);
  }

  const calculate = getCalculateAction(context);
  if (calculate) {
    actions.push(calculate);
  }

  const open_config = getOpenConfigAction(context);
  if (open_config) {
    actions.push(open_config);
  }

  const open_logs = getOpenLogsAction(context);
  if (open_logs) {
    actions.push(open_logs);
  }

  const current_version = getCurrentVersionAction(context);
  if (current_version) {
    actions.push(current_version);
  }

  return actions;
};
