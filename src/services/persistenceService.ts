
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  limit,
  increment
} from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { NewsAnalysis, Message, Chat, GlobalStats } from '../types';

export const persistenceService = {
  async saveVerification(content: string, analysis: NewsAnalysis) {
    if (!auth.currentUser) return;
    try {
      const q = collection(db, 'verifications');
      await addDoc(q, {
        userId: auth.currentUser.uid,
        content,
        ...analysis,
        timestamp: Date.now()
      });
      await updateDoc(doc(db, 'global_stats', 'main'), {
        queriesAnswered: increment(1)
      }).catch(() => {
        setDoc(doc(db, 'global_stats', 'main'), { usersHelped: 1000, queriesAnswered: 5000 }, { merge: true });
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'verifications');
    }
  },

  async getVerifications() {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, 'verifications'), 
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, 'list', 'verifications');
    }
  },

  async createChat(language: string) {
    if (!auth.currentUser) return null;
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        language,
        updatedAt: Date.now(),
        lastMessage: ''
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', 'chats');
    }
  },

  async saveMessage(chatId: string, message: Message) {
    if (!auth.currentUser) return;
    try {
      const chatRef = doc(db, 'chats', chatId);
      const messagesRef = collection(chatRef, 'messages');
      
      await addDoc(messagesRef, {
        ...message,
        userId: auth.currentUser.uid,
        timestamp: Date.now()
      });

      await updateDoc(chatRef, {
        lastMessage: message.content,
        updatedAt: Date.now()
      });

      await updateDoc(doc(db, 'global_stats', 'main'), {
        queriesAnswered: increment(1)
      }).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, 'create', `chats/${chatId}/messages`);
    }
  },

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, 'list', `chats/${chatId}/messages`);
    });
  },

  subscribeToLiveUpdates(callback: (updates: any[]) => void) {
    const q = query(
      collection(db, 'live_updates'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(updates);
    }, (error) => {
      handleFirestoreError(error, 'list', 'live_updates');
    });
  },

  subscribeToGlobalStats(callback: (stats: GlobalStats) => void) {
    return onSnapshot(doc(db, 'global_stats', 'main'), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as GlobalStats);
      }
    }, (error) => {
      handleFirestoreError(error, 'get', 'global_stats/main');
    });
  },

  async addLiveUpdate(title: string, content: string, type: 'news' | 'alert' | 'result') {
    try {
      await addDoc(collection(db, 'live_updates'), {
        title,
        content,
        type,
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'live_updates');
    }
  }
};
