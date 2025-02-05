// utils/firebaseUtils.js
import { storage } from '@/lib/firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const uploadImageToFirebase = (file, setProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `avatars/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
