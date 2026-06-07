# Astra AI Chat + Realtime Firebase Group Chat

This repository contains a browser-based Astra/Nexus AI chat page and reusable React/Firestore group chat modules.

## Astra Engine timeout fix

The screenshot error (`Astra Engine connection timed out or client disconnected`) happens when the browser request to the AI engine is aborted, times out, loses network connectivity, or receives an upstream API failure. The static `index.html` now includes a more resilient client implementation:

- Uses the OpenAI Responses API endpoint from the browser demo.
- Adds an explicit 45-second `AbortController` timeout instead of allowing a hung request.
- Retries one transient timeout/rate-limit/server failure.
- Disables duplicate submits while a request is in flight.
- Shows actionable errors for missing keys, unauthorized keys, rate limits, unavailable models, and network timeouts.
- Keeps iPhone Safari layout stable with `viewport-fit=cover`, safe-area padding, `100dvh`/`100svh`, and touch-friendly controls.

> Production note: browser API-key demos are only for local testing. In production, proxy AI requests through your backend so secrets are never exposed to the client.

## Firestore structure

```txt
groups/{groupId}
  members: string[]
  createdBy: string
  createdAt: timestamp

groups/{groupId}/messages/{messageId}
  senderId: string
  senderName: string
  text: string
  createdAt: timestamp
  updatedAt: timestamp
  type: "text"

groups/{groupId}/typing/{userId}
  userId: string
  senderName: string
  updatedAt: timestamp
```

## Group chat features

- Shared group message path (`groups/{groupId}/messages`) so every member receives the same realtime stream.
- `onSnapshot` subscriptions for messages, typing presence, and group metadata.
- Optimistic UI message rendering with automatic reconciliation when snapshot updates.
- Group join loading state and previous-message hydration after refresh.
- Typing indicator (`Aman is typing…`) with debounce and cleanup.
- Auto-scroll to latest messages.
- Duplicate listener prevention via effect cleanup returns.
- Mobile-first CSS with iPhone Safari-safe units (`100dvh`/`100svh`) and smooth touch scrolling.

## Core files

re- `index.html`: Astra/Nexus browser chat UI with timeout, retry, and clear error handling.
- `src/firebase/groupChatService.js`: Firestore queries, writes, and listener subscriptions.
- `src/hooks/useGroupChat.js`: reusable React hook for realtime group state.
- `src/components/GroupChatPage.jsx`: full chat UI with sender differentiation + instant rendering.
- `src/styles/group-chat.css`: responsive chat styles.

## Notes

- Keep each user document in `users/{uid}` with a `username` field for member-lookup by username.
- For large groups, switch online presence querying from `where('in')` batches to a dedicated `groups/{groupId}/presence` subcollection.
