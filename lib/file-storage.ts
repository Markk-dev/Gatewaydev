import { storage, BUCKET_ID } from './appwrite';
import { ID } from 'appwrite';

export async function uploadFile(file: File): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const response = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    return { success: true, fileId: response.$id };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
}

export async function getFileUrl(fileId: string): Promise<string> {
  try {
    const result = storage.getFileView(BUCKET_ID, fileId);
    return result.toString();
  } catch (error) {
    console.error('Error getting file URL:', error);
    return '';
  }
}

export async function getFileDownloadUrl(fileId: string): Promise<string> {
  try {
    const result = storage.getFileDownload(BUCKET_ID, fileId);
    return result.toString();
  } catch (error) {
    console.error('Error getting file download URL:', error);
    return '';
  }
}
