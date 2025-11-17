import type {
	LanguageModelV2Middleware,
	LanguageModelV2StreamPart,
} from "@ai-sdk/provider";

const title = "[AI Log Middleware]";

/**
 * 日志中间件
 *
 * 记录 AI 模型的生成过程和响应内容
 */
export const logMiddleware: LanguageModelV2Middleware = {
	wrapGenerate: async ({ doGenerate }) => {
		const result = await doGenerate();

		// 输出 finishReason 和 usage（用于监控和调试）
		if ((result as any)?.finishReason) {
			console.log(`${title} 🔚 FinishReason:`, (result as any).finishReason);
		}
		if ((result as any)?.usage) {
			console.log(
				`${title} 📊 Usage:`,
				JSON.stringify((result as any).usage, null, 2),
			);
		}

		// 输出工具调用信息（重要）
		if ((result as any)?.toolCalls?.length > 0) {
			console.log(
				`${title} tool calls (${(result as any).toolCalls.length}):`,
				(result as any).toolCalls.map((tc: any) => ({
					toolName: tc.toolName,
					toolCallId: tc.toolCallId,
				})),
			);
		}

		// 输出工具结果（重要，特别是错误信息）
		if ((result as any)?.toolResults?.length > 0) {
			(result as any).toolResults.forEach((tr: any, index: number) => {
				const result = tr.result || tr.output || {};
				if (result.success === false || result.error) {
					console.error(
						`${title} ❌ tool result [${index}] error:`,
						result.error || "Unknown error",
					);
				}
			});
		}

		return result;
	},

	wrapStream: async ({ doStream }) => {
		const { stream, ...rest } = await doStream();

		let generatedText = "";
		let hasToolCall = false;
		let toolCallCount = 0;
		let toolResultCount = 0;
		let hasError = false;

		const transformStream = new TransformStream<
			LanguageModelV2StreamPart,
			LanguageModelV2StreamPart
		>({
			transform(chunk, controller) {
				if (chunk.type === "text-delta") {
					generatedText += chunk.delta;
				} else if (chunk.type === "tool-call") {
					hasToolCall = true;
					toolCallCount++;
					console.log(
						`[AI Stream] 🛠️  工具调用 [${toolCallCount}]: ${chunk.toolName}`,
					);
				} else if (chunk.type === "tool-result") {
					toolResultCount++;
					const result = (chunk as any).result || (chunk as any).output || {};

					// 只记录错误或重要信息
					if (result.success === false || result.error) {
						hasError = true;
						console.error(
							`[AI Stream] ❌ 工具结果 [${toolResultCount}] (${chunk.toolName}) 错误:`,
							result.error || "Unknown error",
						);
					} else if (result.success === true && result.images) {
						// 图片生成成功，记录简要信息
						console.log(
							`[AI Stream] ✅ 工具结果 [${toolResultCount}] (${chunk.toolName}): 成功生成 ${result.images.length} 张图片`,
						);
					}
				} else if (chunk.type === "finish") {
					console.log(
						`[AI Stream] 🏁 流完成: finishReason=${chunk.finishReason}`,
					);
					if ((chunk as any).usage) {
						console.log(
							`[AI Stream] usage:`,
							JSON.stringify((chunk as any).usage, null, 2),
						);
					}
				}

				controller.enqueue(chunk);
			},

			flush() {
				// 流结束时输出简要总结
				if (hasToolCall || hasError || generatedText.length > 0) {
					console.log(`[AI Stream] 📊 流结束总结:`);
					if (generatedText) {
						console.log(`[AI Stream]   文本长度: ${generatedText.length} 字符`);
					}
					if (hasToolCall) {
						console.log(
							`[AI Stream]   工具调用: ${toolCallCount} 次, 工具结果: ${toolResultCount} 次`,
						);
					}
					if (hasError) {
						console.log(`[AI Stream]   ⚠️  包含错误`);
					}
				}
			},
		});

		return {
			stream: stream.pipeThrough(transformStream),
			...rest,
		};
	},
};
