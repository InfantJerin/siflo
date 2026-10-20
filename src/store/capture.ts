import { create } from 'zustand';

// Hands a captured photo from the camera screen back to the screen that opened it.
interface CaptureState {
  photoUri: string | null;
  setPhoto: (uri: string | null) => void;
}

export const useCapture = create<CaptureState>((set) => ({
  photoUri: null,
  setPhoto: (photoUri) => set({ photoUri }),
}));
