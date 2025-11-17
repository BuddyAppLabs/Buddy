import z from "zod";
import { createText2ImageCore } from "./core";
import { text2imageModels } from "./models";

const title = "[Text2Image]";

/**
 * 文本转图片工具
 * 根据文字描述生成高质量图片
 */
export function createText2ImageTool(dashScopeApiKey?: string) {
	return {
		description: `根据文字描述生成高质量图片。支持多种模型和尺寸。
		
使用场景：
- 生成故事插图
- 创建封面图
- 根据场景描述生成图片

注意事项：
- 提示词最多 800 个字符
- 图片生成为异步任务：创建任务后返回 taskId，调用方需轮询查询状态`,
		inputSchema: z.object({
			prompt: z.string().describe("图片生成的文字描述，最多 800 个字符"),
			size: z
				.string()
				.optional()
				.default("1024*1024")
				.describe(
					"图像尺寸，格式为 '宽度*高度'，范围 [512, 1440]，默认 1024*1024",
				),
			n: z.number().optional().default(1).describe("生成图片数量，默认 1"),
			model: z.string().describe("使用的模型"),
		}),
		execute: async (args: {
			prompt: string;
			size?: string;
			n?: number;
			model: string;
		}) => {
			const rawApiKey = dashScopeApiKey || process.env.DASHSCOPE_API_KEY;

			// 检查 API Key 是否存在
			if (!rawApiKey) {
				console.error(
					`${title} DashScope API 密钥未配置，请在环境变量 DASHSCOPE_API_KEY 中配置，或通过工厂入参注入`,
				);
				return {
					success: false,
					error:
						"DashScope API 密钥未配置，请在环境变量 DASHSCOPE_API_KEY 中配置，或通过工厂入参注入",
				};
			}

			// 检查 API Key 是否为字符串类型
			if (typeof rawApiKey !== "string") {
				return {
					success: false,
					error: `DashScope API 密钥类型错误，期望字符串类型，实际类型: ${typeof rawApiKey}`,
				};
			}

			// 校验模型参数
			if (!args.model) {
				return {
					success: false,
					error: "缺少模型参数，请先让用户选择图片生成模型。",
				};
			}

			const allowedModelIds = new Set(text2imageModels.map((m) => m.id));
			if (!allowedModelIds.has(args.model)) {
				const allIds = text2imageModels.map((m) => m.id).join(", ");
				const hint = `可用模型: ${allIds}`;
				return {
					success: false,
					error: `无效的模型: ${args.model}。${hint}`,
				};
			}

			const apiKey = rawApiKey;

			try {
				// 创建文本转图片实例
				const text2imageCore = createText2ImageCore(apiKey);
				const model = args.model;

				// 创建生成任务
				console.log(`${title} 创建生成任务，prompt: ${args.prompt}`);
				console.log(`${title} API KEY: ${apiKey.slice(0, 8)}...`);
				console.log(`${title} Model Input: ${args.model}`);
				console.log(`${title} Model: ${model}`);
				const response = await text2imageCore.createTask({
					prompt: args.prompt,
					size: args.size || "1024*1024",
					n: args.n || 1,
					model: model,
				});

				// 兼容错误与直出结果
				if (!response?.ok) {
					const msg =
						(response &&
							(response.message || response.error || response.output)) ||
						"创建任务失败";
					return { success: false, error: String(msg) };
				}

				// 有些情况下可能直接返回结果（极少数同步成功）
				if (
					response?.output?.results &&
					Array.isArray(response.output.results)
				) {
					return {
						success: true,
						taskId: response.output.task_id,
						images: response.output.results.map((r: { url: string }) => r.url),
						message: "图片生成成功",
					};
				}

				const taskId = response?.output?.task_id;
				if (!taskId) {
					const msg =
						(response &&
							(response.message || response.error || response.code)) ||
						"未返回任务ID";
					return { success: false, error: String(msg) };
				}

				// 直接返回 taskId，交由调用方自行轮询查询状态
				return {
					success: true,
					taskId,
					status: "PENDING",
					model,
					message: `已创建任务，请稍后使用任务ID轮询查询状态`,
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "未知错误";
				console.error(`${title} 错误: ${errorMessage}`);

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
	};
}
