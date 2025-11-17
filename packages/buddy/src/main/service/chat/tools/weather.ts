import { tool } from "ai";
import { z } from "zod";

export const weatherTool = tool({
	description: "Get the weather in a location",
	inputSchema: z.object({
		location: z.string().describe("The location to get the weather for"),
	}),
	execute: async ({ location }) => {
		console.log(`Get the weather in ${location}`);
		const conditions = ["Sunny", "Cloudy", "Rainy", "Snowy"];
		const randomCondition =
			conditions[Math.floor(Math.random() * conditions.length)];

		return {
			location,
			temperature: Math.floor(Math.random() * 35),
			condition: randomCondition,
			unit: "°C",
		};
	},
});
