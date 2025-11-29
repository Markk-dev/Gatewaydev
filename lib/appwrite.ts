import { Client, Databases, Account, Storage } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '692b46ca00092fe55fb2';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

export const DATABASE_ID = 'gateway_db';
export const USERS_TABLE_ID = 'users';
export const CONVERSATIONS_TABLE_ID = 'conversations';
export const MESSAGES_TABLE_ID = 'messages';
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '692b4b99002b069769f1';

export { client };
