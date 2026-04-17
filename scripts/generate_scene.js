#!/usr/bin/env node
/**
 * 夜访禁书区场景图生成脚本
 * 根据结局生成图书馆场景图片prompt
 */

const endings = {
  escape_empty: {
    scene: 'library entrance at dawn, safe but empty-handed',
    mood: 'disappointed but relieved',
    bubble: 'At least I wasn\'t caught...',
    visual: 'golden morning light streaming through windows, quiet bookshelves'
  },
  caught_pince: {
    scene: 'being grabbed by Madam Pince in the library',
    mood: 'terrified and caught red-handed',
    bubble: 'Got you! To the Headmaster\'s office!',
    visual: 'angry librarian gripping collar, scattered books, harsh lantern light'
  },
  caught_filch: {
    scene: 'caught by Argus Filch at the library corridor',
    mood: 'cornered and doomed',
    bubble: 'Aha! Caught ya, you little thief!',
    visual: 'glowing lantern illuminating terrified face, grimy stone walls'
  },
  success: {
    scene: 'holding the glowing book "Advanced Potion-Making" in the secret chamber',
    mood: 'triumphant and awestruck',
    bubble: 'I actually found it...',
    visual: 'mysterious blue glow from ancient tome, hidden chamber, floating dust motes'
  },
  cursed: {
    scene: 'being consumed by dark mist from a cursed book',
    mood: 'horrified as shadows swallow them',
    bubble: 'No... NO!',
    visual: 'tendrils of black smoke wrapping around body, glowing red runes, forbidden tome'
  }
};

function generatePrompt(characterName, endingId) {
  const data = endings[endingId] || endings.escape_empty;
  
  const prompt = `${characterName} in the Hogwarts library at night, ` +
    `${data.scene}, ${data.mood}, ` +
    `speech bubble showing "${data.bubble}", ` +
    `${data.visual}, ` +
    `dark atmospheric lighting, magical horror aesthetic, ` +
    `cinematic composition, detailed fantasy art style, Harry Potter universe`;
  
  const promptCN = `${characterName}在深夜的霍格沃茨图书馆里，` +
    `${data.scene}，表情${data.mood}，` +
    `头顶的对话气泡写着"${data.bubble}"，` +
    `${data.visual}，` +
    `昏暗神秘的灯光，魔法恐怖氛围，` +
    `电影级构图，精细奇幻插画风格，哈利波特世界观`;
  
  return { prompt, promptCN };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法: node generate_scene.js "<character_name>" <ending_id>');
    console.log('可选结局: escape_empty, caught_pince, caught_filch, success, cursed');
    process.exit(1);
  }
  
  const characterName = args[0];
  const endingId = args[1];
  
  if (!endings[endingId]) {
    console.error(`错误: 无效的结局类型 ${endingId}`);
    process.exit(1);
  }
  
  const { prompt, promptCN } = generatePrompt(characterName, endingId);
  
  const output = {
    character: characterName,
    ending: endingId,
    prompt: prompt,
    prompt_cn: promptCN
  };
  
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { generatePrompt, endings };
