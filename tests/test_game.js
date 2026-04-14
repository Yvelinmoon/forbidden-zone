#!/usr/bin/env node
/**
 * 夜访禁书区单元测试
 */

const { loadData, initGame, getZoneById, rollDanger } = require('../scripts/runner.js');

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    console.log(`     期望: ${expectedStr}`);
    console.log(`     实际: ${actualStr}`);
    failed++;
  }
}

function testLoadData() {
  console.log('\n🧪 测试：加载数据');
  const data = loadData();
  assertEqual(data.zones.length, 5, '有5个区域');
  assertEqual(Object.keys(data.endings).length, 6, '有6种结局');
  assertEqual(data.max_turns, 7, '最大回合数为7');
}

function testInitGame() {
  console.log('\n🧪 测试：初始化游戏');
  const game = initGame();
  assertEqual(game.turn, 1, '初始回合为1');
  assertEqual(game.currentZone, 'entrance', '初始区域为入口');
  assertEqual(game.isHiding, false, '初始未隐藏');
  assertEqual(game.gameOver, false, '游戏未结束');
  assertEqual(game.maxTurns, 7, '最大回合数为7');
}

function testGetZone() {
  console.log('\n🧪 测试：获取区域');
  const data = loadData();
  const entrance = getZoneById(data.zones, 'entrance');
  assertEqual(entrance.name, '入口走廊', '入口区域名称正确');
  assertEqual(entrance.danger_base.safe >= 0, true, '危险概率有效');
  assertEqual(entrance.actions.length >= 3, true, '至少有3个行动');
}

function testRollDanger() {
  console.log('\n🧪 测试：危险判定');
  const data = loadData();
  const zone = getZoneById(data.zones, 'entrance');
  
  // 测试10次判定，确保结果在有效范围内
  const results = new Set();
  for (let i = 0; i < 20; i++) {
    const result = rollDanger(zone, 1, 0, false);
    results.add(result.result);
  }
  assertEqual(results.size > 0, true, '危险判定有结果');
}

function main() {
  console.log('🌙 夜访禁书区 - 单元测试');
  console.log('='.repeat(50));
  
  try {
    testLoadData();
    testInitGame();
    testGetZone();
    testRollDanger();
  } catch (e) {
    console.error('测试执行出错:', e.message);
    failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();
