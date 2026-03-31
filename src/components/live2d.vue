<template>
	<div ref="containerRef" class="live2d-container" style="width: 800px; height: 800px"></div>

	<!-- 控制按钮示例 -->
	<div class="controls" style="margin-top: 20px">
		<button @click="playMotion('tap_body')">播放 tap_body 动作</button>
		<button @click="playRandomMotion('tap_body')">随机 tap_body 动作</button>
		<button @click="playExpression('smile')">切换微笑表情</button>
		<button @click="toggleOutfit">切换衣服（示例）</button>
		<button @click="resetModel">重置模型</button>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Application } from "@pixi/app";
import { extensions } from "@pixi/extensions";
import { Ticker, TickerPlugin } from "@pixi/ticker";
import { Live2DModel, MotionPriority, MotionPreloadStrategy } from "pixi-live2d-display/cubism4"; // 根据你的模型版本选择 cubism4 或 cubism5

const containerRef = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let model: any = null; // Live2DModel 实例

onMounted(async () => {
	if (!containerRef.value) return;

	// 1. 注册必要插件
	Live2DModel.registerTicker(Ticker);
	extensions.add(TickerPlugin);
	// 在 PixiJS v6 中，InteractionManager 会自动注册，无需手动注册

	// 2. 创建 Pixi 应用（背景透明）
	app = new Application({
		width: 800,
		height: 800,
		backgroundAlpha: 0, // 透明背景
		antialias: true,
	});
	containerRef.value.appendChild(app.view as HTMLCanvasElement);

	// 3. 加载你的 Live2D 模型（路径必须是 public 下的静态路径）
	model = await Live2DModel.from("ulvm2_0001/ulvm2_0001.model3.json", {
		motionPreload: MotionPreloadStrategy.IDLE, // 预加载 idle 动作
	});

	app.stage.addChild(model);

	// 4. 设置初始位置、大小（根据模型调整）
	model.x = 400;
	model.y = 1000;
	model.scale.set(0.4, 0.4); // 缩放
	model.anchor.set(0.5, 0.5); // 中心点

	// 5. 自动交互（鼠标跟踪 + 点击触发动作）
	model.on("hit", (hitAreas: string[]) => {
		if (hitAreas.includes("body")) {
			model.motion("tap_body", undefined, MotionPriority.NORMAL); // 点击身体播放动作
		}
		if (hitAreas.includes("head")) {
			model.expression(); // 随机表情
		}
	});

	console.log("模型加载完成！可 console.dir(model) 查看内部结构");
  console.dir(model.internalModel.motionManager)
console.log('可用动作组：', Object.keys(model.internalModel.motionManager.groups || {}))
console.log('详细 motions 定义：', model.internalModel.motionManager.motionGroups)
});

// 播放指定动作
const playMotion = (group: string) => {
	if (model) model.motion(group, undefined, MotionPriority.FORCE);
};

// 随机动作
const playRandomMotion = (group: string) => {
	if (model) model.motion(group);
};

// 切换表情（需模型有定义的表情文件）
const playExpression = (name?: string | number) => {
	if (model) model.expression(name); // name 或 index，或不传随机
};

// 换装示例（核心代码！）
const toggleOutfit = () => {
	if (!model) return;
	const internal = model.internalModel;
	const coreModel = internal.coreModel; // Cubism 核心模型

	// 替换为你的模型实际部件 ID（在 Cubism Editor 中查看，或 console.log 模型文件）
	const clothesPart1 = "PARTS_01"; // 示例：第一套衣服
	const clothesPart2 = "PARTS_02"; // 示例：第二套衣服

	const index1 = coreModel.getPartIndex(clothesPart1);
	const index2 = coreModel.getPartIndex(clothesPart2);

	if (index1 !== -1 && index2 !== -1) {
		// 切换逻辑：显示一套，隐藏另一套（可扩展多套）
		const isFirstOn = coreModel.getPartOpacity(index1) > 0.5;
		coreModel.setPartOpacity(index1, isFirstOn ? 0 : 1);
		coreModel.setPartOpacity(index2, isFirstOn ? 1 : 0);
		console.log("已切换衣服！");
	} else {
		console.warn("未找到部件 ID，请检查模型部件名");
	}
};

// 重置
const resetModel = () => {
	if (model) {
		model.motion("idle", undefined, MotionPriority.IDLE); // 回到 idle
		// 可额外重置所有部件 opacity = 1
	}
};

onUnmounted(() => {
	if (app) {
		app.destroy(true, { children: true, texture: true });
		app = null;
		model = null;
	}
});
</script>

<style>
.live2d-container {
	border: 1px solid #ccc;
}
</style>
