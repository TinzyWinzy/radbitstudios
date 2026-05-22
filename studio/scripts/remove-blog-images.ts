import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

async function removeImages() {
  const snap = await db.collection('blog_posts').where('published', '==', true).get();
  let updated = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.imageUrl && data.imageUrl !== '/blog/placeholder.svg') {
      await doc.ref.update({ imageUrl: '/blog/placeholder.svg' });
      console.log(`  Set placeholder for "${data.title}"`);
      updated++;
    }
  }
  console.log(`\nDone. Updated ${updated} posts.`);
  process.exit(0);
}

removeImages().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
