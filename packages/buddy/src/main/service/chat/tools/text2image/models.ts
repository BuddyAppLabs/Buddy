export interface ModelInfo {
	id: string;
	description: string;
}

const models: ModelInfo[] = [
	{
		id: "wan2.5-t2i-preview",
		description:
			"通义万相2.5-文生图-Preview，全新升级模型架构。画面美学、设计感、真实质感显著提升，精准指令遵循，擅长中英文和小语种文字生成，支持复杂结构化长文本和图表、架构图等内容生成。",
	},
	{
		id: "wan2.5-i2i-preview",
		description:
			"通义万相2.5-图像编辑-Preview，全新升级模型架构。支持指令控制实现丰富的图像编辑能力，指令遵循能力进一步提升，支持高一致性保持的多图参考生成，文字生成表现优异。",
	},
	{
		id: "wan2.2-t2i-flash",
		description:
			"万相2.2极速版。在创意性、稳定性、写实质感上全面升级，生成速度快，性价比高。",
	},
	{
		id: "wan2.2-t2i-plus",
		description:
			"万相2.2专业版，当前最新模型。在创意性、稳定性、写实质感上全面升级，生成细节丰富。",
	},
	{
		id: "wanx2.1-t2i-turbo",
		description: "万相2.1极速版。生成速度快，效果均衡。",
	},
	{
		id: "wanx2.1-t2i-plus",
		description: "万相2.1专业版。生成图像细节更丰富，速度稍慢。",
	},
	{
		id: "wanx2.0-t2i-turbo",
		description: "万相2.0极速版。擅长质感人像与创意设计，性价比高。",
	},
	{
		id: "wanx-v1",
		description:
			"通义万相-文本生成图像大模型，支持中英文双语输入，重点风格包括但不限于水彩、油画、中国画、素描、扁平插画、二次元、3D卡通",
	},
	{
		id: "qwen-image-plus",
		description:
			"通义千问系列图像生成模型,参数规模约200亿。具备卓越的文本渲染能力,在复杂文本渲染、各类生成与编辑任务中表现出色,多个公开基准测试中获得SOTA。",
	},
	{
		id: "qwen-image",
		description:
			"通义千问系列首个图像生成模型,参数规模200亿。具备卓越的文本渲染能力,在复杂文本渲染、各类生成与编辑任务中表现出色,在多个公开基准测试中获得SOTA。",
	},
	{
		id: "qwen-image-edit",
		description:
			"通义千问系列首个图像编辑模型,成功将Qwen-Image的文本渲染能力拓展到编辑任务上。支持精准的中英双语文字编辑、视觉外观与语义双重编辑、具备强大的跨基准性能表现。",
	},
	{
		id: "qwen-image-edit-plus",
		description:
			"通义千问系列图像编辑Plus模型,在首版Edit模型基础上进一步优化了推理性能与系统稳定性,大幅缩短图像生成与编辑的响应时间;支持单次请求返回多张图片,显著提升用户体验。",
	},
	{
		id: "qwen-image-edit-plus-2025-10-30",
		description:
			"通义千问系列图像编辑Plus模型,在首版Edit模型基础上进一步优化了推理性能与系统稳定性,大幅缩短图像生成与编辑的响应时间;支持单次请求返回多张图片,显著提升用户体验。此版本为2025年10月30日快照。",
	},
	{
		id: "qwen-mt-image",
		description:
			"专注做图片翻译的模型服务,能将中、英、日等11个语言的图片翻译到指定的语言,精准还原图片排版和内容信息,支持术语定义、敏感词过滤、商品主体检测等自定义功能,提供灵活、准确、高效的图像本地化服务。",
	},
];

export const text2imageModels = models;
