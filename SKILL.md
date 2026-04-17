---
name: forbidden-zone
description: Night visit to the Restricted Section. Use when users say "night visit library", "restricted section", "library exploration", "forbidden zone", "library at night", etc. in a Hogwarts context. Players sneak into the Hogwarts Library at night to obtain "Advanced Potion-Making" while avoiding Madam Pince and Filch's patrols. Uses pure Node.js scripts for danger calculations, with 5 different endings.
compatibility: neta-creative skill, Node.js
---

# Night Visit to the Restricted Section

## Character Constraints

- The protagonist of this Skill experience is the **current Agent's character** (hereinafter referred to as `{character_name}`), not the user
- Automatically read the current Agent's character name; all narration, dialogue, and actions must revolve around `{character_name}`
- The user is an observer who guides or intervenes through Discord Component buttons
- Must use the character name at the start: `"Late at night, {character_name} arrived at the Hogwarts Library entrance..."`
- All area descriptions, action results, and ending determinations must be experiences of `{character_name}`
- Prohibited from using second-person "you" to refer to the user

## Important Notes

This skill assumes installation in a folder containing `data/` and `scripts/` subdirectories.
When executing scripts, please **first cd to the skill root directory**, then run the command.
All scripts are pure Node.js, no Python or additional dependencies needed.

## Project Structure

```
forbidden-zone/
├── SKILL.md                    # This file
├── data/
│   └── zones.json              # Map areas, danger probabilities, ending data
├── scripts/
│   ├── runner.js               # Game determination script
│   └── generate_scene.js       # Scene image prompt generator
└── tests/
    └── test_game.js            # Unit tests
```

## 🚨 Mandatory Output Format Specifications

### Interaction Rules (Must Strictly Follow)

- ⚠️ **This Skill is turn-based exploration; each turn must be output separately and wait for user response**
- Upon reaching a new area, **must STOP and output action buttons**, only call script determination after receiving response
- **Absolutely forbidden** to advance multiple turns automatically or auto-execute actions

### Fixed Structure for Each Round Output
Each output must simultaneously include:
1. **Narrative text**: Current area description + {character_name}'s state/actions
2. **Discord Component buttons**: All actionable buttons for the current area (3-4 buttons)

### Strictly Prohibited
- ❌ Automatically advancing multiple areas consecutively
- ❌ Using plain text lists instead of Discord Component buttons
- ❌ Calling script determination automatically before user clicks button/replies
- ❌ Outputting "approaching danger" and "final result" in one go

### Discord Component API Format (Must Use)
```json
{
  "type": 1,
  "components": [
    {
      "type": 2,
      "label": "🚶 Sneak Carefully",
      "style": 1,
      "custom_id": "action_sneak"
    },
    {
      "type": 2,
      "label": "🫥 Hide Behind Painting",
      "style": 2,
      "custom_id": "action_hide"
    },
    {
      "type": 2,
      "label": "🏃 Rush Through",
      "style": 3,
      "custom_id": "action_run"
    },
    {
      "type": 2,
      "label": "🚪 Exit Library",
      "style": 4,
      "custom_id": "action_retreat"
    }
  ]
}
```
- `style: 1` = Blue primary button
- `style: 2` = Gray secondary button
- `style: 3` = Green success button
- `style: 4` = Red danger button
- **Prohibited** from using `Button: "..."` pseudo-code format output

### Waiting Rules
- Must wait for user response after outputting buttons
- If user replies with text instead of clicking button, treat as valid input and proceed normally
- Only call `processAction()` for determination after receiving user response
- If game hasn't ended after determination results are announced, must output new area buttons again and wait

## Game Background

Late night at the Hogwarts Library. Legend says in the secret archives deep within the Restricted Section, the wizarding world's most precious forbidden book is kept — "Advanced Potion-Making".

{character_name}'s mission is to sneak into the library before dawn, find this book, and escape safely. But beware:
- **Madam Pince**: Library attendant, patrols the lending area and Restricted Section at night
- **Filch**: Caretaker, patrols the entrance corridors at night
- **Forbidden Book Curses**: Books in the depths of the Restricted Section carry dangerous curses

## Map Areas (from outside to inside)

| Area | Danger Source | Features |
|------|---------------|----------|
| 🚪 Entrance Corridor | Filch | Exit, can leave |
| 📚 Main Lending Area | Madam Pince | Can search for clues |
| 🚪 Restricted Section Gate | Madam Pince + Alarm | Door needs opening |
| 🌑 Deep Restricted Section | Madam Pince + Curse | High danger |
| 🔮 Secret Archives | Double danger | "Advanced Potion-Making" location |

## Core Flow

### Step 1: Game Initialization

You (the LLM) as the guide, first read the map data, then start:

```
🌙 **Night Visit to the Restricted Section**

"Late at night, the Hogwarts Library..."
"{character_name} quietly arrived at the library entrance."
"Legend says in the secret archives deep within the Restricted Section, the wizarding world's most precious forbidden book is kept — "Advanced Potion-Making"."

{character_name} needs within 7 turns to:
1. Sneak into various library areas
2. Avoid Madam Pince and Filch
3. Find "Advanced Potion-Making"
4. Leave safely

Ready? Let's begin!
```

### Step 2: Get Current Area Information

**Use Bash tool to get current area data:**

```bash
cd <skill-root-directory> && node scripts/runner.js --zones
```

Or directly read zones.json:

```bash
cd <skill-root-directory> && cat data/zones.json
```

### Step 3: Display Available Actions

**Use Discord Component to display action buttons** (every turn):

Each area has 3-4 action options, for example entrance corridor:
- 🚶 Sneak Carefully → {character_name} goes to Main Lending Area (base risk)
- 🫥 Hide Behind Painting → {character_name} stays in current area, danger reduced (requires hiding)
- 🏃 Rush Through → {character_name} goes to Main Lending Area, increased risk
- 🚪 Exit Library → {character_name} immediate ending: empty-handed

### Step 4: Execute Action and Determine

**After collecting user's chosen action, call script for danger determination:**

```bash
cd <skill-root-directory> && node scripts/runner.js --action <action_id> --zone <current_zone_id> --turn <turn_number>
```

**Or directly call processAction function within the skill**, passed by LLM:
- Current area ID
- Chosen action ID
- Whether in hiding state

Script will return determination result:
- `safe` → {character_name} succeeded, proceed to next step
- `near_danger` → {character_name} approached danger, display warning message
- `caught_pince` → {character_name} caught by Madam Pince, ending
- `caught_filch` → {character_name} caught by Filch, ending
- `cursed` → {character_name} consumed by forbidden book, ending

### Step 5: Announce Results and Continue

**Based on determination result, announce:**

- **Safe**: Display next area description, ask {character_name}'s next action
- **Approaching Danger**: Display warning, let user choose dodge or continue for {character_name}
- **Caught**: Display {character_name}'s corresponding ending image
- **Timeout**: Dawn arrives, {character_name} leaves empty-handed

### Step 6: Ending Display

**After game ends, call neta-creative to generate image based on {character_name}'s ending type:**

```
{character_name} obtained "Advanced Potion-Making" / was consumed by forbidden book / was caught by Madam Pince / safely evacuated...
```

Use script-generated prompt or custom template.

## Danger Determination Rules

Script `runner.js` uses **probability pool** mechanism:

1. **Base Probability**: Each area has preset danger probability
2. **Turn Penalty**: Safe probability -5% per turn
3. **Action Risk**: Quick running/searching +15% risk, hiding -15% risk
4. **Hidden State**: Safe probability +15% when hiding

## 5 Endings

| Ending | Condition | Score |
|--------|-----------|-------|
| 🚪 Safe Evacuation | Choose "Exit Library" | 10 points |
| 👵 Caught by Madam Pince | Caught in Lending Area/Restricted Section | 0 points |
| 🔦 Caught by Filch | Caught in Entrance/Corridor | 0 points |
| 📕 Obtained "Advanced Potion-Making" | Successfully took book in Secret Archives | 100 points |
| 🌑 Consumed by Forbidden Book | Triggered curse in Deep Section/Secret Chamber | -50 points |

## Complete Workflow Example

```
User: "I want to visit the Restricted Section at night"

You:
1. Read data/zones.json to understand map
2. Opening introduction of game background (with {character_name} as protagonist)
3. Display action options for Entrance Corridor (Discord buttons)
4. User chooses "Sneak Carefully"
5. Call script determination (safe/near_danger/caught)
6. Announce {character_name}'s result, continue to display next area
7. Repeat steps 3-6 until ending
8. Bash: cd <skill-dir> && node scripts/generate_scene.js "{character_name}" <ending_id> (generate prompt)
9. Call neta-creative to generate {character_name}'s ending image
```

### Step 7: Ending Image Generation

**After game ends, must call script to generate ending image prompt:**

```bash
cd <skill-root-directory> && node scripts/generate_scene.js "{character_name}" <ending_id>
```

`<ending_id>` available values: `escape_empty`, `caught_pince`, `caught_filch`, `success`, `cursed`

Then **directly call neta-creative**, using the `prompt` field output by the script.

**Image Requirements:**
- Must include **speech bubble**: {character_name} or other characters in the scene have floating dialogue bubbles above their heads showing classic lines corresponding to the ending
- Scene atmosphere must match ending (victory's mysterious blue light / caught tense lighting / cursed dark smoke)

## Notes

- Always maintain tense, suspenseful narrative tone
- Danger determinations are uniformly handled by scripts, do not judge on your own
- Use Discord Component to provide clear action options
- Each area has at least 3 action options, at most 4
- After ending, default to directly generate corresponding scene image (consistent with Sorting Hat test)
- Maximum 7 turns, timeout counts as "empty-handed"
