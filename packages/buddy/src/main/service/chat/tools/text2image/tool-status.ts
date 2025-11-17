import z from "zod";
import { createText2ImageCore } from "./core";

const title = "[Text2ImageStatus]";

export function createText2ImageStatusTool(dashScopeApiKey?: string) {
	return {
		description:
			"查询文本转图片任务状态。输入 taskId，返回任务当前状态，以及在成功时返回图片地址列表。",
		inputSchema: z.object({
			taskId: z.string().min(1, "taskId 不能为空"),
		}),
		execute: async (args: { taskId: string }) => {
			const rawApiKey = dashScopeApiKey || process.env.DASHSCOPE_API_KEY;
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
			if (typeof rawApiKey !== "string") {
				return {
					success: false,
					error: `DashScope API 密钥类型错误，期望字符串类型，实际类型: ${typeof rawApiKey}`,
				};
			}

			try {
				const core = createText2ImageCore(rawApiKey);
				const status = await core.getTaskStatus({ task_id: args.taskId });

				if (!status?.ok) {
					const msg =
						(status && (status.message || status.error || status.output)) ||
						"查询任务状态失败";
					return { success: false, taskId: args.taskId, error: String(msg) };
				}

				const taskStatus = status?.output?.task_status;
				if (taskStatus === "SUCCEEDED") {
					return {
						success: true,
						taskId: args.taskId,
						status: taskStatus,
						images: status.output.results.map((r: { url: string }) => r.url),
					};
				}
				if (taskStatus === "FAILED") {
					const errorCode = status.output?.code;
					const errorMessage = status.output?.message;
					const submitTime = status.output?.submit_time;
					const endTime = status.output?.end_time;

					let detailedError = "图片生成失败";
					if (errorCode && errorMessage) {
						detailedError = `${detailedError} - 错误代码: ${errorCode}, 错误信息: ${errorMessage}`;
					} else if (errorMessage) {
						detailedError = `${detailedError} - ${errorMessage}`;
					}

					return {
						success: false,
						taskId: args.taskId,
						status: taskStatus,
						error: detailedError,
						errorCode,
						errorMessage,
						submitTime,
						endTime,
					};
				}
				return {
					success: false,
					taskId: args.taskId,
					status: taskStatus ?? "UNKNOWN",
					error: `任务状态: ${taskStatus ?? "未知"}，请稍后查询状态`,
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "未知错误";
				console.error(`${title} 错误: ${errorMessage}`);
				return {
					success: false,
					taskId: args.taskId,
					error: errorMessage,
				};
			}
		},
	};
}
