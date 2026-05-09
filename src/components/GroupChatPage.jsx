import { useEffect, useRef, useState } from 'react';
import { useGroupChat } from '../hooks/useGroupChat';
import '../styles/group-chat.css';

export default function GroupChatPage({ db, groupId, currentUser }) {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const { messages, isJoining, sending, onlineUsers, typingLabel, sendMessage, onInputChange } = useGroupChat({
    db,
    groupId,
    currentUser,
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const message = draft;
    setDraft('');
    await sendMessage(message);
  }

  if (isJoining) {
    return <div className="group-loader">Joining group…</div>;
  }

  return (
    <section className="group-chat-shell">
      <header>
        <h2>Group Chat</h2>
        <p>{onlineUsers.length} online</p>
      </header>

      <main className="message-list" ref={listRef}>
        {messages.map((msg) => {
          const mine = msg.senderId === currentUser.uid;
          return (
            <article key={msg.id} className={`message-row ${mine ? 'mine' : ''}`}>
              {!mine && <span className="sender">{msg.senderName}</span>}
              <div className="bubble">{msg.text}</div>
            </article>
          );
        })}
      </main>

      <footer>
        <p className="typing-indicator">{typingLabel}</p>
        <form onSubmit={handleSubmit}>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onInputChange(e.target.value);
            }}
            placeholder="Type your message"
            autoComplete="off"
          />
          <button type="submit" disabled={sending}>
            Send
          </button>
        </form>
      </footer>
    </section>
  );
}
