#!/usr/bin/env node
/**
 * 夜访禁书区游戏主脚本
 * 驱动游戏流程、危险判定、结局结算
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const PROJECT_DIR = path.resolve(SCRIPT_DIR, '..');
const DATA_DIR = path.join(PROJECT_DIR, 'data');

function loadData() {
  const dataPath = path.join(DATA_DIR, 'zones.json');
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function getZoneById(zones, id) {
  return zones.find(z => z.id === id);
}

function rollDanger(zone, turn, actionRiskMod, isHiding) {
  const base = zone.danger_base;
  
  // 回合惩罚：每回合安全概率降低5%
  const turnPenalty = (turn - 1) * 5;
  
  // 躲藏奖励：隐藏时安全概率+15%，危险概率-15%
  const hideBonus = isHiding ? -15 : 0;
  
  // 计算最终概率
  const safe = Math.max(5, base.safe + hideBonus - turnPenalty + actionRiskMod);
  const nearDanger = base.near_danger + (isHiding ? -5 : 0) + Math.max(0, turnPenalty - actionRiskMod) / 2;
  const caughtPince = base.caught_pince + Math.max(0, turnPenalty - actionRiskMod);
  const caughtFilch = base.caught_filch;
  const cursed = base.cursed + Math.max(0, turnPenalty - actionRiskMod);
  
  const total = safe + nearDanger + caughtPince + caughtFilch + cursed;
  
  // Roll 点
  const roll = Math.random() * total;
  
  let result;
  if (roll < safe) {
    result = 'safe';
  } else if (roll < safe + nearDanger) {
    result = 'near_danger';
  } else if (roll < safe + nearDanger + caughtPince) {
    result = 'caught_pince';
  } else if (roll < safe + nearDanger + caughtPince + caughtFilch) {
    result = 'caught_filch';
  } else {
    result = 'cursed';
  }
  
  return {
    result,
    roll,
    total,
    details: {
      safe,
      nearDanger,
      caughtPince,
      caughtFilch,
      cursed
    }
  };
}

function getNarratorComment(data, result, zone) {
  const comments = data.narrator_comments[result];
  const comment = comments[Math.floor(Math.random() * comments.length)];
  return comment;
}

function initGame() {
  const data = loadData();
  return {
    turn: 1,
    currentZone: 'entrance',
    isHiding: false,
    hasClue: false,
    gameOver: false,
    ending: null,
    history: [],
    maxTurns: data.max_turns
  };
}

function getGameState(game, data) {
  const zone = getZoneById(data.zones, game.currentZone);
  return {
    turn: game.turn,
    maxTurns: game.maxTurns,
    currentZone: {
      id: zone.id,
      name: zone.name,
      description: zone.description
    },
    isHiding: game.isHiding,
    hasClue: game.hasClue,
    actions: zone.actions.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description || ''
    }))
  };
}

function processAction(game, actionId, data) {
  const zone = getZoneById(data.zones, game.currentZone);
  const action = zone.actions.find(a => a.id === actionId);
  
  if (!action) {
    return { error: `无效的行动: ${actionId}` };
  }
  
  // 检查是否是直接结束行动
  if (action.ending) {
    game.gameOver = true;
    game.ending = action.ending;
    return {
      gameOver: true,
      ending: data.endings[action.ending],
      action: action.name,
      message: getNarratorComment(data, 'safe', zone)
    };
  }
  
  // 危险判定
  const isHiding = action.id === 'hide';
  const riskMod = action.risk_mod || 0;
  const dangerResult = rollDanger(zone, game.turn, riskMod, isHiding);
  
  // 记录历史
  game.history.push({
    turn: game.turn,
    zone: game.currentZone,
    action: action.name,
    result: dangerResult.result,
    roll: dangerResult.roll,
    total: dangerResult.total
  });
  
  // 处理判定结果
  let message = getNarratorComment(data, dangerResult.result, zone);
  let newZone = game.currentZone;
  let gameOver = false;
  let ending = null;
  let clueFound = false;
  
  switch (dangerResult.result) {
    case 'safe':
      newZone = action.next_zone || game.currentZone;
      game.isHiding = false;
      break;
    case 'near_danger':
      // 接近危险，给一次额外选择机会
      message += " 你必须立刻做出反应！";
      // 停留在当前区域
      game.isHiding = false;
      break;
    case 'caught_pince':
      gameOver = true;
      ending = data.endings.caught_pince;
      game.ending = 'caught_pince';
      break;
    case 'caught_filch':
      gameOver = true;
      ending = data.endings.caught_filch;
      game.ending = 'caught_filch';
      break;
    case 'cursed':
      gameOver = true;
      ending = data.endings.cursed;
      game.ending = 'cursed';
      break;
  }
  
  // 检查是否有线索
  if (action.clue && dangerResult.result === 'safe') {
    clueFound = true;
    game.hasClue = true;
    message += " 你发现了一些有用的线索...";
  }
  
  // 切换区域
  if (newZone !== game.currentZone) {
    game.currentZone = newZone;
  }
  
  // 检查回合上限
  if (!gameOver && game.turn >= game.maxTurns) {
    gameOver = true;
    ending = data.endings.timeout;
    game.ending = 'timeout';
    message = "雄鸡开始打鸣了！天亮前你必须离开，否则就会被发现。";
  }
  
  game.gameOver = gameOver;
  
  // 推进回合
  if (!gameOver) {
    game.turn++;
  }
  
  return {
    gameOver,
    ending,
    message,
    newZone: newZone !== game.currentZone ? getZoneById(data.zones, newZone) : null,
    clueFound,
    dangerResult: dangerResult.result,
    turn: game.turn,
    maxTurns: game.maxTurns
  };
}

function getStatus(game, data) {
  return {
    turn: game.turn,
    maxTurns: game.maxTurns,
    currentZone: game.currentZone,
    isHiding: game.isHiding,
    hasClue: game.hasClue,
    gameOver: game.gameOver,
    ending: game.ending,
    history: game.history
  };
}

function printZones() {
  const data = loadData();
  console.log('='.repeat(60));
  console.log('📚 夜访禁书区 - 地图区域');
  console.log('='.repeat(60));
  
  data.zones.forEach(zone => {
    console.log(`\n【${zone.name}】${zone.name_en}`);
    console.log(zone.description);
    console.log('行动:');
    zone.actions.forEach(action => {
      console.log(`  - ${action.name}${action.ending ? ' [结局]' : ''}`);
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('结局类型:');
  Object.entries(data.endings).forEach(([id, ending]) => {
    console.log(`  ${ending.emoji} ${id}: ${ending.name}`);
  });
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--zones') || args.includes('-z')) {
    printZones();
    return;
  }
  
  // 简单测试模式
  if (args.includes('--test')) {
    const game = initGame();
    const data = loadData();
    console.log('游戏初始化成功！');
    console.log('当前区域:', getZoneById(data.zones, game.currentZone).name);
    console.log('回合上限:', game.maxTurns);
    return;
  }
  
  console.log('用法: node runner.js [选项]');
  console.log('选项:');
  console.log('  --zones, -z     显示所有区域和结局');
  console.log('  --test          测试游戏初始化');
  console.log('\n注意: 本游戏通过LLM驱动，请使用skill模式运行');
}

if (require.main === module) {
  main();
}

module.exports = { 
  loadData, 
  initGame, 
  processAction, 
  getGameState, 
  getStatus,
  rollDanger,
  getZoneById
};
