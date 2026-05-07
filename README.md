# OpenAI Key Checker Website

Simple static site that checks whether an OpenAI API key can authenticate by calling `GET /v1/models`.

## Run locally

```bash
python3 -m http.server 8000
```

Then open: <http://localhost:8000>

## Notes

- The key is only used in the browser session.
- Do **not** use this approach for production apps; API keys should be handled server-side.
