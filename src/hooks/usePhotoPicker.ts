import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState, useCallback } from 'react';

interface UsePhotoPickerReturn {
  preview: string | undefined;
  file: File | undefined;
  isLoading: boolean;
  error: string | null;
  pick: () => Promise<void>;
  clear: () => void;
}

export function usePhotoPicker(): UsePhotoPickerReturn {
  const [preview, setPreview] = useState<string>();
  const [file, setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });

      if (photo.webPath) {
        setPreview(photo.webPath);

        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const newFile = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
        setFile(newFile);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pick photo';
      if (!message.includes('cancelled') && !message.includes('canceled')) {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPreview(undefined);
    setFile(undefined);
    setError(null);
  }, []);

  return { preview, file, isLoading, error, pick, clear };
}
