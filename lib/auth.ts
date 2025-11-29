import { account, databases, DATABASE_ID, USERS_TABLE_ID } from './appwrite';
import { ID } from 'appwrite';

export interface User {
  $id: string;
  name: string;
  email: string;
}

export async function createEmailSession(email: string, password: string) {
  try {
    // Check if there's already an active session
    try {
      await account.get();
      // If we get here, user is already logged in
      return { success: true, session: null };
    } catch {
      // No active session, proceed with login
    }

    const session = await account.createEmailPasswordSession(email, password);
    return { success: true, session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await account.get();
    return user as User;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAccount(email: string, password: string, name: string) {
  try {
    // Check if there's already an active session and delete it
    try {
      await account.get();
      await account.deleteSession('current');
    } catch {
      // No active session, continue
    }

    // Create Appwrite account
    const user = await account.create(ID.unique(), email, password, name);

    // Create session
    await account.createEmailPasswordSession(email, password);

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
