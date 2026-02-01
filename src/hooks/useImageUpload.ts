import { useState, useCallback, useEffect } from 'react';
import { compressImage } from '../services/storageService';

interface UseImageUploadReturn {
  file: File | null;
  previewUrl: string;
  isLoading: boolean;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearImage: () => void;
}

export function useImageUpload(initialUrl?: string): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null;
      setError(null);

      if (!selected) {
        setFile(null);
        setPreviewUrl(initialUrl || '');
        return;
      }

      setIsLoading(true);

      try {
        const compressedFile = await compressImage(selected);
        setFile(compressedFile);

        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(URL.createObjectURL(compressedFile));
      } catch {
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
      } finally {
        setIsLoading(false);
      }
    },
    [initialUrl, previewUrl]
  );

  const clearImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(initialUrl || '');
    setError(null);
  }, [initialUrl, previewUrl]);

  return { file, previewUrl, isLoading, error, handleFileChange, clearImage };
}
