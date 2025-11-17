import z from "zod";

/**
 * 询问图片信息的 client-side tool
 * 这个工具会在客户端显示交互式 UI，让用户通过点击按钮选择选项
 * 图片尺寸规则：格式为'宽度*高度'，范围 [512, 1440] 像素，默认 1024*1024
 */
export const askForImageInfoTool = {
	name: "ask_for_image_info",
	description:
		"Ask the user for image generation information (image style, size, quality) by showing interactive buttons. Use this tool when you need to collect image creation requirements. 通过显示交互式按钮询问用户图片生成信息（图片风格、尺寸、质量）。当你需要收集图片创作需求时使用此工具。",
	inputSchema: z.object({
		question: z
			.string()
			.describe("The question to ask the user. 要询问用户的问题。"),
		options: z
			.array(
				z.object({
					label: z.string().describe("The label for the option. 选项的标签。"),
					value: z.string().describe("The value for the option. 选项的值。"),
				}),
			)
			.describe(
				"Array of options to display as buttons. 要显示为按钮的选项数组。",
			),
		field: z
			.enum(["imageStyle", "imageSize", "imageQuality"])
			.describe("The field this question is for. 这个问题的字段类型。"),
	}),
	// 注意：没有 execute 函数，这是 client-side tool
};
