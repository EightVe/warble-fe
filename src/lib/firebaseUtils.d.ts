declare module '@/lib/firebaseUtils' {
    export function uploadImageToFirebase(
      file: File,
      setProgress: (progress: number) => void,
      setUploading: (uploading: boolean) => void
    ): Promise<string>;
  }