import z from "zod";

/**
 * 询问故事信息的 client-side tool
 * 这个工具会在客户端显示交互式 UI，让用户通过点击按钮选择选项
 */
export const askForStoryInfoTool = {
	name: "ask_for_story_info",
	description:
		"Ask the user for story information (target age, story style, number of chapters) by showing interactive buttons. Use this tool when you need to collect story creation requirements. 通过显示交互式按钮询问用户故事信息（目标年龄、故事风格、章节数量）。当你需要收集故事创作需求时使用此工具。",
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
			.enum(["targetAge", "storyStyle", "chapterCount"])
			.describe("The field this question is for. 这个问题的字段类型。"),
	}),
	// 注意：没有 execute 函数，这是 client-side tool
};
