import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAfeSkPwu4CytTeHWZqjcPs_qjw4Ycz87M",
    authDomain: "real-33816464-5a38c.firebaseapp.com",
    projectId: "real-33816464-5a38c",
    storageBucket: "real-33816464-5a38c.firebasestorage.app",
    messagingSenderId: "23730500548",
    appId: "1:23730500548:web:78c265a4cbf313ba712a91"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
