const TITLE = "[Text2ImageCore]";

export interface CreateTaskArgs {
	prompt: string;
	size?: string; // e.g. "1024*1024"
	n?: number; // number of images
	model?: string; // model id
}

export interface GetTaskStatusArgs {
	task_id: string;
}

export interface Text2ImageCore {
	createTask: (args: CreateTaskArgs) => Promise<any>;
	getTaskStatus: (args: GetTaskStatusArgs) => Promise<any>;
}

const DASH_SCOPE_T2I_ENDPOINT =
	"https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";
const DASH_SCOPE_TASK_ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/tasks";

export function createText2ImageCore(
	apiKeyFromFactory: string,
): Text2ImageCore {
	async function doFetch(url: string, options: RequestInit): Promise<any> {
		console.log(`${TITLE} URL: ${url}`);
		console.log(`${TITLE} Options: ${JSON.stringify(options)}`);
		const apiKey = apiKeyFromFactory;
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
			"X-DashScope-Async": "enable",
		};
		try {
			const res = await fetch(url, { ...options, headers });
			console.log(`${TITLE} Response: ${JSON.stringify(res)}`);
			const text = await res.text();
			console.log(`${TITLE} Text: ${text}`);
			try {
				const json = JSON.parse(text);
				// 附加基础响应信息，便于上层判断
				return { ok: res.ok, status: res.status, ...json };
			} catch {
				return { ok: res.ok, status: res.status, output: text };
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "未知错误";
			console.error(`${TITLE} 错误: ${errorMessage}`);
			throw new Error(errorMessage);
		}
	}

	return {
		async createTask(args: CreateTaskArgs): Promise<any> {
			console.log(`${TITLE} Create Task Args: ${JSON.stringify(args)}`);
			const body = {
				model: args.model,
				input: {
					prompt: args.prompt,
				},
				parameters: {
					size: args.size || "1024*1024",
					n: args.n || 1,
				},
			};
			return doFetch(DASH_SCOPE_T2I_ENDPOINT, {
				method: "POST",
				body: JSON.stringify(body),
			});
		},
		async getTaskStatus(args: GetTaskStatusArgs): Promise<any> {
			const url = `${DASH_SCOPE_TASK_ENDPOINT}/${encodeURIComponent(args.task_id)}`;
			return doFetch(url, {
				method: "GET",
			});
		},
	};
}
