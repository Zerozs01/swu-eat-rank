import { onRequest, type Request as FnRequest } from 'firebase-functions/v2/https';
import type { Response } from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import Busboy from 'busboy';
import { v4 as uuidv4 } from 'uuid';

initializeApp();
const storage = getStorage();

// HTTPS function to upload menu image via server (bypasses browser CORS)
export const uploadMenuImage = onRequest({ region: 'asia-east1', cors: [ 'https://swu-eat-rank.web.app', 'https://swu-eat-rank.firebaseapp.com', 'http://localhost:5173' ] }, async (req: FnRequest, res: Response) => {
  // Allow only POST
  if (req.method !== 'POST') {
    res.set('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Basic extra CORS headers for custom clients (on top of onRequest cors option)
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  const method = req.method as unknown as string;
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const menuId = (req.query as any).menuId as string | undefined;
  if (!menuId) {
    res.status(400).json({ error: 'menuId is required' });
    return;
  }

  // Verify Firebase ID token if provided (recommended: require admin only)
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing Authorization Bearer token' });
      return;
    }
    const idToken = authHeader.split('Bearer ')[1];
  const decoded = await getAuth().verifyIdToken(idToken);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    // Optionally check admin email whitelist here if needed
  } catch (e) {
    console.error('Auth verify error', e);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const busboy = Busboy({ headers: req.headers as any });
  let uploadPromise: Promise<any> | null = null;
  let fileName = '';
  let mimeType = '';

  busboy.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; mimeType: string; encoding: string }) => {
    const { filename, mimeType: mt } = info;
    fileName = `${Date.now()}-${filename}`;
    mimeType = mt;
    const bucket = storage.bucket();
    const destPath = `menus/${menuId}/${fileName}`;
    const downloadToken = uuidv4();
    const writeStream = bucket.file(destPath).createWriteStream({
      resumable: false,
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    uploadPromise = new Promise((resolve, reject) => {
      file.pipe(writeStream)
        .on('finish', async () => {
          try {
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media&token=${downloadToken}`;
            resolve({ path: destPath, url: downloadUrl });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', reject);
    });
  });

  busboy.on('finish', async () => {
    try {
      const result = await uploadPromise;
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Upload error', err);
      res.status(500).json({ error: 'Upload failed', details: err?.message });
    }
  });

  busboy.end((req as any).rawBody);
});
