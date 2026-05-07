# Dart Revision Tool

A browser-based quiz app for studying Dart. Runs entirely in the browser with no build step — progress is saved locally via `localStorage`.

## Using the quiz

**Practice mode** — shows feedback and the correct answer after each question. You rate your confidence (Not sure / Pretty sure / Certain), which schedules when that question reappears using spaced repetition. Questions you get wrong are queued for retry at the end of the session.

**Test mode** — no feedback until you finish. Shows your final score and lets you review all answers at the end.

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`9` | Select answer by number |
| `Enter` | Confirm / advance to next question |
| `←` `→` | Navigate during review |

### Spaced repetition

Each question tracks a streak of consecutive correct sessions. Correct answers push the next review further out; wrong answers reset the streak.

| Streak | Next review |
|--------|-------------|
| 0 | Immediately |
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 14 days |
| 5+ | 30 days |

A question is **mastered** at a streak of 3.

## Deploying to GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set the source to your main branch, root folder
4. The site will be live at `https://<username>.github.io/<repo-name>`

## Updating questions

Replace `public_quiz_data.json` with a new file in the same format:

```json
[
  {
    "question": "Your question text here",
    "choices": [
      "Option A",
      "Option B",
      "Option C"
    ],
    "correct_choices": ["A"]
  }
]
```

- `correct_choices` is an array of letters (`"A"`, `"B"`, etc.)
- For multi-answer questions, list all correct letters: `["A", "C"]`

## Updating explanations

Edit `explanations.json`. Each entry must be in the same position as its corresponding question in `public_quiz_data.json`.

```json
[
  {
    "explanation": "Text shown after answering.",
    "example": "Optional code example shown below the explanation."
  }
]
```

- Use `null` for `example` if there's no code example
- Inline code: wrap in backticks — `` `code` ``
- Code blocks: use fenced markdown — ` ```dart ... ``` `
- For multi-answer questions, use the `A ✓ — reason. B ✗ — reason.` format

## File structure

```
index.html              Page shell
quiz.css                All styles
quiz.js                 All app logic
public_quiz_data.json   Questions and answers
explanations.json       Explanations and code examples
```
