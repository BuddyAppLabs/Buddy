import z from "zod";

/**
 * 故事大纲生成工具
 *
 * 用途：根据用户提供的信息（主题、目标年龄、故事风格、章节数量）生成完整的故事大纲
 */

/**
 * 故事大纲的数据结构
 */
export const storyOutlineSchema = z.object({
	storyId: z
		.string()
		.describe(
			"故事ID，格式：两位数字-英文单词用连字符连接，如：rainbow-forest-adventure",
		),
	title: z.string().describe("故事标题"),
	description: z.string().describe("故事简介，100-200字"),
	chapters: z
		.array(
			z.object({
				chapterId: z
					.string()
					.describe("章节ID，格式：两位数字-英文单词用连字符连接，如：meeting"),
				title: z.string().describe("章节标题"),
				summary: z.string().describe("章节概要，50-100字"),
				content: z.string().describe("章节文字内容，100-200字，1-3句话"),
				sceneDescription: z
					.string()
					.describe(
						"场景描述，用于生成插图，需详细描述：场景环境、角色外观（性别、年龄、发型、服装）、动作表情、光线氛围、镜头视角、艺术风格等",
					),
			}),
		)
		.describe("章节列表"),
});

/**
 * 工具定义
 */
export const generateOutlineTool = {
	name: "generate_outline",
	description:
		"根据用户提供的信息（主题、目标年龄、故事风格、章节数量）生成完整的故事大纲。当你收集到所有必要信息后，必须立即调用此工具生成大纲，不要只是确认信息。Generate a complete story outline based on user's information (theme, target age, story style, number of chapters). When you have collected all necessary information, you must immediately call this tool to generate the outline. Do not just confirm the information.",
	inputSchema: storyOutlineSchema,
};
