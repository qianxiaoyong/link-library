import assert from "node:assert/strict";
import { parseLinkText } from "../src/shared/parser";

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[通过] ${name}`);
  } catch (error) {
    console.error(`[失败] ${name}`);
    throw error;
  }
}

const BAIDU_SINGLE = `通过网盘分享的文件：26秋待整理
链接: https://pan.baidu.com/s/1cPNxQV0v0ok0zAw00czW_Q?pwd=gr89 提取码: gr89 
--来自百度网盘超级会员v6的分享`;

const BAIDU_BATCH = `【超级会员V6】通过百度网盘分享的文件：26秋待整理
链接：https://pan.baidu.com/s/1Qa-aUqPz5_5FaS3hkKnNHA?pwd=d7fv 
提取码：d7fv

【超级会员V6】通过百度网盘分享的文件：26秋加入网址
链接：https://pan.baidu.com/s/1iWrBSQnYNTTJuyqh58qFhQ?pwd=d7fv 
提取码：d7fv

【超级会员V6】通过百度网盘分享的文件：26秋初中教辅
链接：https://pan.baidu.com/s/1hCebWqRSJYazlFwgFX27rQ?pwd=d7fv 
提取码：d7fv`;

const QUARK_SINGLE = `我用夸克网盘分享了「🍎⭐️小学英语3-6年级上册《优秀英语作文范文》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/66e70ee7aac7`;

const QUARK_BATCH = `我用夸克网盘分享了「🍎⭐️小学英语3-6年级上册《优秀英语作文范文》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/6db30be59286

我用夸克网盘分享了「🍎⭐️小学语文1-6年级上册《期末复习专项合集》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/712a61f963b3

我用夸克网盘分享了「🍎⭐️小学数学1-6年级上册《期末复习专项合集》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/7fef3f13f7c7`;

const MIXED_INPUT = `${BAIDU_SINGLE}

${QUARK_SINGLE}`;

runTest("空输入返回空结果", () => {
  const result = parseLinkText("");
  assert.equal(result.items.length, 0);
  assert.equal(result.failures.length, 0);
  assert.equal(result.summary.totalItems, 0);
});

runTest("百度单条", () => {
  const result = parseLinkText(BAIDU_SINGLE);

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].platform, "baidu");
  assert.equal(result.items[0].title, "26秋待整理");
  assert.match(result.items[0].rawUrl, /\?pwd=gr89/);
  assert.doesNotMatch(result.items[0].url, /\?pwd=gr89/);
  assert.equal(result.items[0].accessCode, "gr89");
  assert.equal(result.summary.baiduCount, 1);
  assert.equal(result.summary.failureCount, 0);
});

runTest("百度批量", () => {
  const result = parseLinkText(BAIDU_BATCH);

  assert.equal(result.items.length, 3);
  assert.deepEqual(
    result.items.map((item) => item.title),
    ["26秋待整理", "26秋加入网址", "26秋初中教辅"],
  );
  assert.equal(result.summary.baiduCount, 3);
  assert.ok(result.items.every((item) => item.accessCode === "d7fv"));
});

runTest("夸克单条", () => {
  const result = parseLinkText(QUARK_SINGLE);

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].platform, "quark");
  assert.equal(
    result.items[0].title,
    "🍎⭐️小学英语3-6年级上册《优秀英语作文范文》",
  );
  assert.equal(result.items[0].url, "https://pan.quark.cn/s/66e70ee7aac7");
  assert.equal(result.items[0].accessCode, null);
  assert.equal(result.summary.quarkCount, 1);
});

runTest("夸克批量", () => {
  const result = parseLinkText(QUARK_BATCH);

  assert.equal(result.items.length, 3);
  assert.equal(result.summary.quarkCount, 3);
  assert.ok(result.items.every((item) => item.accessCode === null));
  assert.ok(
    result.items.every((item) =>
      item.title.includes("🍎⭐️"),
    ),
  );
});

runTest("混合输入", () => {
  const result = parseLinkText(MIXED_INPUT);

  assert.equal(result.items.length, 2);
  assert.equal(result.summary.baiduCount, 1);
  assert.equal(result.summary.quarkCount, 1);
  assert.equal(result.summary.failureCount, 0);
  assert.equal(result.items[0].platform, "baidu");
  assert.equal(result.items[1].platform, "quark");
});

console.log("\n全部解析器测试通过。");
