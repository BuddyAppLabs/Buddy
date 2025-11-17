import z from "zod";
import { text2imageModels } from "./models";

export function text2ImageModelsTool() {
	return {
		description:
			"列出可用的文本转图片模型及其描述，包含推荐模型标记。本工具仅用于获取模型列表信息，不会让用户做选择。当你需要用户选择具体使用哪个文生图模型时，必须配合 ask_for_image_model 工具使用，不要在没有用户确认的情况下自行决定模型。",
		inputSchema: z.object({}),
		execute: async () => {
			return {
				success: true,
				models: text2imageModels,
			};
		},
	};
}
