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
// 把整个 toggleOutfit 函数替换成下面这个：
const toggleOutfit = () => {
	if (!model) return;
	const coreModel = model.internalModel.coreModel;

	// 打印所有部件ID（第一次点击按钮时看控制台，复制你需要的衣服ID）
	console.log("=== 当前模型所有部件ID ===", coreModel._partIds || "未找到");

	// 示例：把下面改成你实际的衣服部件ID（从上面 console 复制）
	const clothesPart1 = "你的衣服部件ID1";   // ←←← 这里改成真实ID！
	const clothesPart2 = "你的衣服部件ID2";   // ←←← 这里改成真实ID！

	const index1 = coreModel.getPartIndex(clothesPart1);
	const index2 = coreModel.getPartIndex(clothesPart2);

	if (index1 >= 0 && index2 >= 0) {
		const opacity1 = coreModel.getPartOpacity(index1);
		coreModel.setPartOpacity(index1, opacity1 > 0.5 ? 0 : 1);
		coreModel.setPartOpacity(index2, opacity1 > 0.5 ? 1 : 0);
		console.log("✅ 衣服切换成功！");
	} else {
		console.warn("❌ 未找到部件ID，请看上面 console 输出");
	}
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
