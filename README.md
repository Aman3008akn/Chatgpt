# Realtime Firebase Group Chat (React)

This repository now includes production-ready group chat logic using Firestore realtime listeners for shared group messaging.

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

## What is fixed

- Shared group message path (`groups/{groupId}/messages`) so every member receives the same realtime stream.
- `onSnapshot` subscriptions for messages, typing presence, and group metadata.
- Optimistic UI message rendering with automatic reconciliation when snapshot updates.
- Group join loading state and previous-message hydration after refresh.
- Typing indicator (`Aman is typing…`) with debounce and cleanup.
- Auto-scroll to latest messages.
- Duplicate listener prevention via effect cleanup returns.
- Mobile-first CSS with iPhone Safari-safe units (`100dvh`/`100svh`) and smooth touch scrolling.

## Core files

- `src/firebase/groupChatService.js`: Firestore queries, writes, and listener subscriptions.
- `src/hooks/useGroupChat.js`: reusable React hook for realtime group state.
- `src/components/GroupChatPage.jsx`: full chat UI with sender differentiation + instant rendering.
- `src/styles/group-chat.css`: responsive chat styles.

## Notes

- Keep each user document in `users/{uid}` with a `username` field for member-lookup by username.
- For large groups, switch online presence querying from `where('in')` batches to a dedicated `groups/{groupId}/presence` subcollection.
