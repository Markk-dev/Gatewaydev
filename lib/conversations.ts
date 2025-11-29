import { databases, DATABASE_ID, CONVERSATIONS_TABLE_ID, MESSAGES_TABLE_ID } from './appwrite';
import { ID, Query } from 'appwrite';

export interface Conversation {
  $id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  $id: string;
  conversation_id: string;
  sender: 'user' | 'bot';
  message: string;
  file_id?: string;
  created_at: string;
}

// Create a new conversation
export async function createConversation(userId: string, firstMessage: string) {
  try {
    // Generate a title from the first message (first 50 chars)
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;

    const conversation = await databases.createDocument(
      DATABASE_ID,
      CONVERSATIONS_TABLE_ID,
      ID.unique(),
      {
        user_id: userId,
        title: title,
        created_at: new Date().toISOString()
      }
    );

    return { success: true, conversation };
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return { success: false, error: error.message };
  }
}

// Get all conversations for a user
export async function getUserConversations(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CONVERSATIONS_TABLE_ID,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(50)
      ]
    );

    return { success: true, conversations: response.documents as unknown as Conversation[] };
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: error.message, conversations: [] };
  }
}

// Add a message to a conversation
export async function addMessage(
  conversationId: string,
  sender: 'user' | 'bot',
  message: string,
  fileId?: string
) {
  try {
    const newMessage = await databases.createDocument(
      DATABASE_ID,
      MESSAGES_TABLE_ID,
      ID.unique(),
      {
        conversation_id: conversationId,
        sender: sender,
        message: message,
        file_id: fileId || null,
        created_at: new Date().toISOString()
      }
    );

    return { success: true, message: newMessage };
  } catch (error: any) {
    console.error('Error adding message:', error);
    return { success: false, error: error.message };
  }
}

// Get all messages for a conversation
export async function getConversationMessages(conversationId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_TABLE_ID,
      [
        Query.equal('conversation_id', conversationId),
        Query.orderAsc('created_at'),
        Query.limit(1000)
      ]
    );

    return { success: true, messages: response.documents as unknown as Message[] };
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return { success: false, error: error.message, messages: [] };
  }
}

// Delete a conversation and its messages
export async function deleteConversation(conversationId: string) {
  try {
    // First, get all messages for this conversation
    const messagesResult = await getConversationMessages(conversationId);
    
    // Delete all messages
    if (messagesResult.success && messagesResult.messages) {
      for (const message of messagesResult.messages) {
        await databases.deleteDocument(DATABASE_ID, MESSAGES_TABLE_ID, message.$id);
      }
    }

    // Delete the conversation
    await databases.deleteDocument(DATABASE_ID, CONVERSATIONS_TABLE_ID, conversationId);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return { success: false, error: error.message };
  }
}
