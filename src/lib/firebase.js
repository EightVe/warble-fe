import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAx8anF0Kw9znv0dEXhmSeS2I6BArvn6dY",
  authDomain: "sevenplay-c1faa.firebaseapp.com",
  projectId: "sevenplay-c1faa",
  storageBucket: "sevenplay-c1faa.appspot.com",
  messagingSenderId: "218714386936",
  appId: "1:218714386936:web:5998c876c91da13d7ae60d"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };