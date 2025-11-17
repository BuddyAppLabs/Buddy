import z from "zod";

/**
 * 询问图片模型的 client-side tool
 * 这个工具会在客户端显示交互式 UI，让用户从模型列表中选择一个模型
 */
export const askForImageModelTool = {
	name: "ask_for_image_model",
	description:
		"Ask the user to choose an image generation model from a list of models by showing an interactive UI. Use this tool when you need the user to select a specific text-to-image model. You must not decide the model by yourself without explicit user confirmation. 通过交互式界面让用户从模型列表中选择一个图片生成模型。当你需要用户选择具体的文生图模型时，必须使用此工具让用户做选择，不能在没有用户明确确认的情况下自行决定使用哪个模型。",
	inputSchema: z.object({
		question: z
			.string()
			.describe("The question to ask the user. 要询问用户的问题。"),
		models: z
			.array(
				z.object({
					id: z.string().describe("Model id. 模型的唯一标识。"),
					name: z.string().describe("Model name. 模型名称。"),
					description: z.string().describe("Model description. 模型描述。"),
				}),
			)
			.describe(
				"Array of models to display for selection. 要展示给用户选择的模型列表。",
			),
	}),
	// 注意：没有 execute 函数，这是 client-side tool
};
