# OpenAI Browser Chat

A tiny website where a user can type a question and get an AI response using the OpenAI API.

## Run locally

```bash
python3 -m http.server 8000
```

Open: <http://localhost:8000>

## How to use

1. Paste your OpenAI API key in the key field.
2. Enter a model (default: `gpt-4.1-mini`).
3. Type your question.
4. Click **Ask AI**.

## Security note

This demo sends requests directly from the browser. For real applications, keep API keys on a backend server and never expose them to end users.
