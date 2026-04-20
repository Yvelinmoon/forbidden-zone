# Night Visit to the Restricted Section

🌙 **Hogwarts Late Night Library Stealth Game**

An AI Agent-exclusive stealth exploration game where you sneak into the Hogwarts Library at night, avoid Madam Pince and Filch's patrols, and find the legendary "Advanced Potion-Making".

## 📁 Project Structure

```
forbidden-zone/
├── SKILL.md                    # OpenCode/Claude Code Skill definition
├── README.md                   # This file
├── data/
│   └── zones.json              # Map areas, danger probabilities, ending data
├── scripts/
│   └── runner.js               # Game determination script
└── tests/
    └── test_game.js            # Unit tests
```

## 🎮 Game Background

Late night at the Hogwarts Library. Legend says in the secret archives deep within the Restricted Section, the wizarding world's most precious forbidden book is kept — "Advanced Potion-Making".

Your mission within 7 turns:
1. Sneak into various library areas
2. Avoid Madam Pince and Filch
3. Find "Advanced Potion-Making"
4. Leave safely

## 🗺️ Map Areas

| Area | Danger Source | Features |
|------|---------------|----------|
| 🚪 Entrance Corridor | Filch | Exit, can leave |
| 📚 Main Lending Area | Madam Pince | Can search for clues |
| 🚪 Restricted Section Gate | Madam Pince + Alarm | Door needs opening |
| 🌑 Deep Restricted Section | Madam Pince + Curse | High danger |
| 🔮 Secret Archives | Double danger | "Advanced Potion-Making" location |

## 🎲 Danger Determination Mechanism

Scripts use **probability pool** for automatic determination:
- Base probability: Each area has preset danger probability
- Turn penalty: Safe probability -5% per turn
- Action risk: Quick action +15%, hiding -15%
- Hidden state: Safe probability +15% when hiding

## 🏁 6 Endings

| Ending | Condition | Score |
|--------|-----------|-------|
| 🚪 Safe Evacuation | Choose "Exit Library" | 10 points |
| 👵 Caught by Madam Pince | Caught in Lending Area/Restricted Section | 0 points |
| 🔦 Caught by Filch | Caught in Entrance/Corridor | 0 points |
| 📕 Obtained "Advanced Potion-Making" | Successfully took book in Secret Archives | 100 points |
| 🌑 Consumed by Forbidden Book | Triggered curse in Deep Section/Secret Chamber | -50 points |
| 🌅 Timeout Exit | Did not achieve goal within 7 turns | 5 points |

## 🎯 Usage

### As a Skill

```bash
mv forbidden-zone ~/.config/opencode/skills/
```

Then say to the Agent:
- "Night visit to the Restricted Section"
- "Library exploration"
- "forbidden zone"

### As Standalone Script

```bash
# View all areas
node scripts/runner.js --zones

# Run tests
node tests/test_game.js
```

## 📦 Dependencies

- **Node.js** ≥ 14.0
- No other dependencies

## 📜 License

MIT License

## 🎬 Credits

Inspired by J.K. Rowling's *Harry Potter* series
