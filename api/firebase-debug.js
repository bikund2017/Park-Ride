export default function handler(req, res) {
  const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

  const privateKeyPreview = process.env.FIREBASE_PRIVATE_KEY
    ? `${process.env.FIREBASE_PRIVATE_KEY.substring(0, 50)}... (${process.env.FIREBASE_PRIVATE_KEY.length} chars)`
    : 'NOT SET';

  const hasNewlines = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.includes('\n')
    : false;

  const hasEscapedNewlines = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.includes('\\n')
    : false;

  res.status(200).json({
    environment: process.env.VERCEL_ENV || 'development',
    credentials: {
      hasProjectId,
      hasClientEmail,
      hasPrivateKey,
      privateKeyPreview,
      privateKeyHasNewlines: hasNewlines,
      privateKeyHasEscapedNewlines: hasEscapedNewlines,
      projectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET'
    }
  });
}
