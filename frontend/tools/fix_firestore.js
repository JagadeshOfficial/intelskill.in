/*
fix_firestore.js

Scans the Firestore collection `learnflow_content`, prints samples and optionally updates documents to normalize fields.

Prerequisites:
 - Create a Firebase service account JSON and set env var: GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
 - Install dependencies: npm i firebase-admin

Usage (PowerShell):
  $env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\to\serviceAccount.json'; node tools/fix_firestore.js --dry
  node tools/fix_firestore.js --apply  # to perform updates

Options:
  --dry     Show what would change (default)
  --apply   Apply the normalization updates in-place
*/

const admin = require('firebase-admin');
const { argv } = require('process');

const APPLY = argv.includes('--apply');
const COLLECTION = 'learnflow_content';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function normalizeDoc(doc) {
  const data = doc.data();
  const norm = { ...data };

  // Normalize courseId/batchId to strings
  if (norm.courseId != null) norm.courseId = String(norm.courseId);
  if (norm.batchId != null) norm.batchId = String(norm.batchId);

  // Normalize folderId
  if (norm.folderId === undefined || norm.folderId === null) {
    norm.folderId = null;
  } else if (typeof norm.folderId === 'string') {
    const s = norm.folderId.trim().toLowerCase();
    if (s === '' || s === 'null' || s === 'root' || s === 'home') norm.folderId = null;
    else if (!isNaN(Number(s))) norm.folderId = Number(s);
  }

  // Normalize download URL & storage path & filename
  norm.downloadUrl = norm.downloadUrl || norm.url || norm.downloadURL || norm.download_url || null;
  norm.storagePath = norm.storagePath || norm.storage_path || norm.path || null;
  norm.fileName = norm.fileName || norm.file_name || norm.name || norm.title || null;

  // Compute a clean title for display: prefer existing title, else fileName or last segment of storagePath
  if (!norm.title || String(norm.title).trim() === '') {
    let candidate = null;
    if (norm.fileName) candidate = String(norm.fileName);
    else if (norm.storagePath) {
      const parts = String(norm.storagePath).split('/');
      candidate = parts[parts.length - 1] || null;
    }
    if (candidate) {
      // strip numeric timestamp prefix like '1765771333111_'
      candidate = candidate.replace(/^\d+_/, '');
      try { candidate = decodeURIComponent(candidate); } catch (e) {}
      norm.title = candidate;
    }
  }

  // set createdAt if missing
  if (!norm.createdAt) {
    norm.createdAt = admin.firestore.FieldValue.serverTimestamp();
  }

  return norm;
}

async function run() {
  console.log('Scanning collection:', COLLECTION);
  const snapshot = await db.collection(COLLECTION).get();
  console.log('Documents found:', snapshot.size);
  let i = 0;
  for (const doc of snapshot.docs) {
    i++;
    const norm = await normalizeDoc(doc);
    const original = doc.data();

    // Compare keys/values
    const changes = {};
    for (const k of Object.keys(norm)) {
      const origVal = original[k];
      const newVal = norm[k];
      // For serverTimestamp, skip if original missing
      if (k === 'createdAt' && !original[k]) {
        changes[k] = newVal;
        continue;
      }
      if (JSON.stringify(origVal) !== JSON.stringify(newVal)) {
        changes[k] = { from: origVal, to: newVal };
      }
    }

    if (Object.keys(changes).length > 0) {
      console.log(`Doc ${doc.id} would change:`, changes);
      if (APPLY) {
        // Prepare update object (avoid serverTimestamp in copy)
        const updateObj = { ...norm };
        if (updateObj.createdAt && updateObj.createdAt._methodName === 'FieldValue') {
          delete updateObj.createdAt; // let serverTimestamp be set via update
        }
        await db.collection(COLLECTION).doc(doc.id).set(updateObj, { merge: true });
        console.log(`Doc ${doc.id} updated.`);
      }
    } else {
      if (i <= 5) console.log(`Doc ${doc.id} already normalized.`);
    }

    if (i % 50 === 0) console.log(`Processed ${i} docs...`);
  }
}

run().then(() => console.log('Done')).catch(err => { console.error(err); process.exit(1); });
