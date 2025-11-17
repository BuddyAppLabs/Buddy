import { tool } from "ai";
import { z } from "zod";

/**
 * 获取当前时间的工具。
 */
export const timeTool = tool({
	description: "Get the current time",
	inputSchema: z.object({}),
	execute: async () => {
		console.log("[AI Chat Time Tool] Get the current time");
		return {
			time: new Date().toLocaleString(),
		};
	},
});
