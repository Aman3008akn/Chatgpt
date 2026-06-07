import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  sendGroupMessage,
  subscribeToGroupMessages,
  subscribeToGroupMeta,
  subscribeToOnlineMembers,
  subscribeToTyping,
  updateTyping,
} from '../firebase/groupChatService';

const TYPING_DEBOUNCE_MS = 1500;

export function useGroupChat({ db, groupId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groupMeta, setGroupMeta] = useState(null);
  const [isJoining, setIsJoining] = useState(true);
  const [sending, setSending] = useState(false);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (!db || !groupId) return;

    setIsJoining(true);
    const unsubMessages = subscribeToGroupMessages(db, groupId, (nextMessages) => {
      setMessages(nextMessages);
      setIsJoining(false);
    });
    const unsubTyping = subscribeToTyping(db, groupId, (typing) => {
      setTypingUsers(typing.filter((u) => u.userId !== currentUser.uid));
    });
    const unsubMeta = subscribeToGroupMeta(db, groupId, (meta) => {
      setGroupMeta(meta);
    });

    return () => {
      unsubMessages();
      unsubTyping();
      unsubMeta();
      clearTimeout(typingTimerRef.current);
    };
  }, [db, groupId, currentUser.uid]);

  useEffect(() => {
    if (!db || !groupMeta?.members?.length) return;
    const unsubPresence = subscribeToOnlineMembers(db, groupMeta.members, setOnlineUsers);
    return unsubPresence;
  }, [db, groupMeta?.members]);

  const sendMessage = useCallback(
    async (text) => {
      const optimisticId = `optimistic-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          text,
          type: 'text',
          createdAt: { toMillis: () => Date.now() },
          optimistic: true,
        },
      ]);
      setSending(true);
      try {
        await sendGroupMessage(db, {
          groupId,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          text,
        });
      } finally {
        setSending(false);
      }
    },
    [db, groupId, currentUser],
  );

  const setTyping = useCallback(
    async (isTyping) => {
      await updateTyping(db, {
        groupId,
        userId: currentUser.uid,
        senderName: currentUser.displayName,
        isTyping,
      });
    },
    [db, groupId, currentUser],
  );

  const onInputChange = useCallback(
    async (value) => {
      await setTyping(Boolean(value.trim()));
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTyping(false), TYPING_DEBOUNCE_MS);
    },
    [setTyping],
  );

  const typingLabel = useMemo(() => {
    if (!typingUsers.length) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].senderName} is typing…`;
    return `${typingUsers.length} people are typing…`;
  }, [typingUsers]);

  return {
    messages,
    isJoining,
    sending,
    onlineUsers,
    typingLabel,
    sendMessage,
    onInputChange,
  };
}
