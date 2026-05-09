import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  arrayUnion,
} from 'firebase/firestore';

export const groupsCollection = (db) => collection(db, 'groups');
export const groupDoc = (db, groupId) => doc(db, 'groups', groupId);
export const groupMessagesCollection = (db, groupId) =>
  collection(db, 'groups', groupId, 'messages');
export const groupTypingDoc = (db, groupId, userId) =>
  doc(db, 'groups', groupId, 'typing', userId);
export const userPresenceDoc = (db, userId) => doc(db, 'presence', userId);

export async function createGroup(db, { groupId, members, createdBy }) {
  await setDoc(groupDoc(db, groupId), {
    members,
    createdBy,
    createdAt: serverTimestamp(),
  });
}

export async function addMemberByUsername(db, { groupId, username }) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const result = await getDocs(q);
  if (result.empty) throw new Error('User not found');

  const userId = result.docs[0].id;
  const groupRef = groupDoc(db, groupId);
  await updateDoc(groupRef, { members: arrayUnion(userId) });
  return userId;
}

export async function sendGroupMessage(db, { groupId, senderId, senderName, text, type = 'text' }) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(groupMessagesCollection(db, groupId), {
    senderId,
    senderName,
    text: trimmed,
    type,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTyping(db, { groupId, userId, senderName, isTyping }) {
  const ref = groupTypingDoc(db, groupId, userId);
  if (isTyping) {
    await setDoc(ref, {
      userId,
      senderName,
      updatedAt: serverTimestamp(),
    });
  } else {
    await deleteDoc(ref);
  }
}

export function subscribeToGroupMessages(db, groupId, callback) {
  const q = query(groupMessagesCollection(db, groupId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      snap,
    );
  });
}

export function subscribeToTyping(db, groupId, callback) {
  const q = query(collection(db, 'groups', groupId, 'typing'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToOnlineMembers(db, members, callback) {
  if (!members.length) return () => {};

  const q = query(collection(db, 'presence'), where('userId', 'in', members.slice(0, 10)));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
}

export function subscribeToGroupMeta(db, groupId, callback) {
  return onSnapshot(groupDoc(db, groupId), (docSnap) => callback(docSnap.data()));
}
