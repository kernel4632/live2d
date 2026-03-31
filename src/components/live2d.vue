<template>
	<div ref="containerRef" class="live2d-container" style="width: 800px; height: 800px"></div>

	<!-- 这组按钮是实验入口：用最直接的方式验证动作、表情、换装、重置是否正常。 -->
	<div class="controls" style="margin-top: 20px">
		<button @click="playMotion('tap_body')">播放 tap_body 动作</button>
		<button @click="playRandomMotion('tap_body')">随机 tap_body 动作</button>
		<button @click="playExpression('smile')">切换微笑表情</button>
		<button @click="toggleOutfit">切换衣服（示例）</button>
		<button @click="resetModel">重置模型</button>
	</div>
</template>

<script setup lang="ts">
/**
 * 这个文件负责：把 Live2D 模型挂到页面上，并提供几个可点击的实验功能。
 * 可直接调用的方法：
 * - playMotion(group)：强制播放指定动作组
 * - playRandomMotion(group)：触发随机表情（当前保留 group 参数是为了按钮调用形式统一）
 * - playExpression(name)：播放指定表情或随机表情
 * - toggleOutfit()：按顺序切换衣服前缀组
 * - resetModel()：回到 expression 组的 idle 优先级动作
 */
import { onMounted, onUnmounted, ref } from "vue";
import { Application } from "@pixi/app";
import { extensions } from "@pixi/extensions";
import { Ticker, TickerPlugin } from "@pixi/ticker";
import { Live2DModel, MotionPriority, MotionPreloadStrategy } from "pixi-live2d-display/cubism4";
// 这里使用 cubism4 入口是因为当前模型资源是 Cubism 4 格式；如果你换了 Cubism 5 模型，需要改为 cubism5。

const containerRef = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let model: any = null;
// 这里先用 any，是为了保留实验阶段调试灵活性；后续稳定后建议替换成更明确的模型类型。

onMounted(async () => {
	// 守卫：容器不存在时直接结束，避免 appendChild 报错。
	if (!containerRef.value) return;

	console.log("开始初始化 Live2D 场景...");

	// ===== 第 1 段：注册运行时插件 =====
	Live2DModel.registerTicker(Ticker);
	extensions.add(TickerPlugin);
	// PixiJS v6 的 InteractionManager 会自动注册，这里不手动加，避免重复配置。

	// ===== 第 2 段：创建画布应用 =====
	app = new Application({
		width: 800,
		height: 800,
		backgroundAlpha: 0,
		// 透明背景是为了让模型更容易嵌入页面，不强制占一个实色背景。
		antialias: true,
	});
	containerRef.value.appendChild(app.view as HTMLCanvasElement);
	console.log("Pixi 应用创建完成");

	// ===== 第 3 段：加载模型资源 =====
	model = await Live2DModel.from("ulvm2_0001/ulvm2_0001.model3.json", {
		motionPreload: MotionPreloadStrategy.NONE,
		// 这里必须设为 NONE：当前资源里 idle 关联了 exp3，预加载 motion 时容易触发解析问题。
	});
	app.stage.addChild(model);
	console.log("模型资源加载完成");

	// ===== 第 4 段：设置初始展示参数 =====
	model.x = 400;
	model.y = 1000;
	model.scale.set(0.4, 0.4);
	model.anchor.set(0.5, 0.5);
	// 以上参数是“让模型先可见”的经验值，后续可按你的画布比例继续微调。

	// ===== 第 5 段：挂载点击命中交互 =====
	model.on("hit", (hitAreas: string[]) => {
		if (hitAreas.includes("body")) {
			model.expression();
			// 点击 body 触发表情，是为了快速验证命中区和表情系统都在工作。
		}

		if (hitAreas.includes("head")) {
			model.expression();
			// 点击 head 同样触发表情，实验阶段优先验证链路，不区分复杂动作逻辑。
		}
	});

	console.log("模型初始化完成，可用 console.dir(model) 查看内部结构");
	console.dir(model.internalModel.motionManager);

	console.log("可用动作组：", Object.keys(model.internalModel.motionManager.groups || {}));
	// 这里的 || {} 是兜底：当 groups 暂未初始化时，Object.keys 不会因为 undefined 报错。
	console.log("表情管理器：", model.internalModel.motionManager.expressionManager);
	if (model.internalModel.motionManager.expressionManager) {
		console.log(
			"可用表情列表：",
			model.internalModel.motionManager.expressionManager.expressions?.map((expressionItem: any) => expressionItem.name),
			// 这里只取 name 是为了调试时快速看“可调用标识”；你也可以改成打印完整 expressionItem 结构。
		);
	}

	console.log("Live2D 场景已就绪");
});

// 业务函数：播放指定动作组。
const playMotion = (group: string) => {
	if (!model) return;
	// 守卫：模型未加载时不执行，避免空对象调用。

	console.log(`开始播放动作组：${group}`);
	model.motion(group, undefined, MotionPriority.FORCE);
	console.log(`动作组播放请求已发送：${group}`);
};

// 业务函数：播放随机表情（当前保留 group 参数仅用于保持调用签名统一）。
const playRandomMotion = (group: string) => {
	if (!model) return;
	// 守卫：模型未加载时不执行，避免空对象调用。

	console.log(`收到随机动作请求，当前实验版本改为随机表情。来源动作组：${group}`);
	model.expression();
	console.log("随机表情播放请求已发送");
};

// 业务函数：播放指定表情；不传 name 时由 SDK 选择随机表情。
const playExpression = (name?: string | number) => {
	if (!model) return;
	// 守卫：模型未加载时不执行，避免空对象调用。

	console.log("开始切换表情：", name ?? "随机");
	model.expression(name);
	console.log("表情切换请求已发送");
};

// 业务函数：按预设衣服前缀顺序轮换显示。
const toggleOutfit = () => {
	if (!model) return;
	// 守卫：模型未加载时不执行，避免访问 internalModel 报错。

	console.log("开始切换衣服");
	const coreModel = model.internalModel.coreModel;

	console.log("当前所有部件ID:", coreModel._partIds || coreModel.getPartIds?.() || "未找到");
	// 这里按“内部字段 -> 方法 -> 文本”三层兜底，保证不同运行时形态下都能看到可读输出。

	const costumeGroups = ["v0000", "v0052", "v0100", "v0101"];
	// 这里是你模型当前可用的衣服前缀；如果你新增服装，只要往数组里追加前缀即可。

	let currentIndex = 0;
	for (let index = 0; index < costumeGroups.length; index++) {
		const testPartId = `${costumeGroups[index]}_Part1`;
		const opacity = coreModel.getPartOpacityById ? coreModel.getPartOpacityById(testPartId) : 0;
		// 这里的三元表达式是在做兼容：支持 getPartOpacityById 就读取真实值，否则用 0 当默认不可见。

		if (opacity > 0.5) {
			currentIndex = index;
			break;
		}
	}

	const nextIndex = (currentIndex + 1) % costumeGroups.length;
	const nextPrefix = costumeGroups[nextIndex];
	// 取模是为了循环切换：到最后一套后会自动回到第一套。

	costumeGroups.forEach((prefix) => {
		for (let partNumber = 1; partNumber <= 8; partNumber++) {
			const partId = `${prefix}_Part${partNumber}`;
			const partIndex = coreModel.getPartIndex(partId);

			if (partIndex < 0) continue;
			// 守卫：模型里不存在这个 partId 时直接跳过，避免无意义设置。

			const shouldShow = prefix === nextPrefix;
			if (coreModel.setPartOpacityById) {
				coreModel.setPartOpacityById(partId, shouldShow ? 1 : 0);
				// 这里的三元表达式是“显示=1 / 隐藏=0”，用于把布尔结果映射成透明度数值。
			} else if (coreModel.setPartOpacity) {
				coreModel.setPartOpacity(partIndex, shouldShow ? 1 : 0);
				// 这条分支是旧接口兼容逻辑，避免不同版本 coreModel 下换装失效。
			}
		}
	});

	console.log(`衣服切换完成，当前前缀：${nextPrefix}`);
};

// 业务函数：重置到一个稳定、安全的默认状态。
const resetModel = () => {
	if (!model) return;
	// 守卫：模型未加载时不执行，避免空对象调用。

	console.log("开始重置模型状态");
	model.motion("expression", undefined, MotionPriority.IDLE);
	// 不直接使用 idle 组，是因为当前资源里 idle 对应 exp3，走 expression 组在这个项目里更稳。
	console.log("模型已重置为 expression 组的空闲状态");
};

onUnmounted(() => {
	if (!app) return;
	// 守卫：应用尚未创建时不销毁，避免重复调用 destroy。

	console.log("开始销毁 Live2D 场景");
	app.destroy(true, { children: true, texture: true });
	app = null;
	model = null;
	console.log("Live2D 场景销毁完成");
});
</script>

<style>
.live2d-container {
	border: 1px solid #ccc;
}
</style>
