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
	motionPreload: MotionPreloadStrategy.NONE, // 重要！改成 NONE，否则 idle 里的 .exp3 会报错
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
	model.expression();   // 随机播放一个表情（因为你的文件都是 exp3）
}
		if (hitAreas.includes("head")) {
			model.expression(); // 随机表情
		}
	});

	console.log("模型加载完成！可 console.dir(model) 查看内部结构");
  console.dir(model.internalModel.motionManager)

console.log("可用动作组：", Object.keys(model.internalModel.motionManager.groups || {}));
console.log("表情管理器：", model.internalModel.motionManager.expressionManager);
if (model.internalModel.motionManager.expressionManager) {
  console.log("可用表情列表：", 
    model.internalModel.motionManager.expressionManager.expressions?.map((e: any) => e.name));
}
});

// 播放指定动作
const playMotion = (group: string) => {
	if (model) model.motion(group, undefined, MotionPriority.FORCE);
};

// 随机动作
const playRandomMotion = (group: string) => {
	if (model) model.expression();   // 随机表情
};
// 切换表情（需模型有定义的表情文件）
const playExpression = (name?: string | number) => {
	if (model) model.expression(name); // name 或 index，或不传随机
};

// 换装示例（核心代码！）
const toggleOutfit = () => {
	if (!model) return;
	const coreModel = model.internalModel.coreModel;

	// 打印所有部件ID（方便你以后调试）
	console.log("当前所有部件ID:", coreModel._partIds || coreModel.getPartIds?.() || "未找到");

	// 使用你模型里实际的衣服部件前缀（v0000 / v0052 / v0100 / v0101）
	const costumeGroups = ['v0000', 'v0052', 'v0100', 'v0101'];

	// 找到当前显示的是哪一套衣服（以 v0000_Part1 为例判断）
	let currentIndex = 0;
	for (let i = 0; i < costumeGroups.length; i++) {
		const testId = `${costumeGroups[i]}_Part1`;
		const opacity = coreModel.getPartOpacityById ? 
			coreModel.getPartOpacityById(testId) : 0;
		if (opacity > 0.5) {
			currentIndex = i;
			break;
		}
	}

	// 切换到下一套
	const nextIndex = (currentIndex + 1) % costumeGroups.length;
	const nextPrefix = costumeGroups[nextIndex];

	// 遍历所有衣服部件，只显示下一套，其余隐藏
	costumeGroups.forEach(prefix => {
		// 每套衣服通常有 Part1, Part2, Part3 等
		for (let i = 1; i <= 8; i++) {   // 最多检查到 Part8，根据你的列表调整
			const partId = `${prefix}_Part${i}`;
			const index = coreModel.getPartIndex(partId);
			if (index >= 0) {
				const shouldShow = (prefix === nextPrefix);
				if (coreModel.setPartOpacityById) {
					coreModel.setPartOpacityById(partId, shouldShow ? 1 : 0);
				} else if (coreModel.setPartOpacity) {
					coreModel.setPartOpacity(index, shouldShow ? 1 : 0);
				}
			}
		}
	});

	console.log(`✅ 已切换到衣服：${nextPrefix}`);
};
// 重置
const resetModel = () => {
	if (model) {
		// idle 组里是 .exp3.json，改用随机播放 expression 组更安全
		model.motion("expression", undefined, MotionPriority.IDLE);
		console.log("已重置为随机表情（因为你的 idle 组是 .exp3）");
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
