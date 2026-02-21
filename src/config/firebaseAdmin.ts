import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let isInitialized = false;

function getServiceAccountJson(): string | null {
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (fromEnv && fromEnv.trim() !== '') return fromEnv;
  // Fallback: read from file for local dev (same file used for Terraform)
  const filePath = path.join(process.cwd(), 'infra', 'firebase-service-account.json');
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch {
    // ignore
  }
  return null;
}

export function initializeFirebaseAdmin(): void {
  if (isInitialized) return;
  const serviceAccountJson = getServiceAccountJson();
  if (!serviceAccountJson || serviceAccountJson.trim() === '') return;
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export function getFirebaseAdmin(): admin.app.App | null {
  return isInitialized ? admin.app() : null;
}

export function isFirebaseConfigured(): boolean {
  return isInitialized;
}
