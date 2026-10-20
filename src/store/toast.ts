import { create } from 'zustand';

interface ToastState {
  message: string | null;
  action?: { label: string; onPress: () => void };
  key: number;
}

export const useToast = create<ToastState>(() => ({ message: null, key: 0 }));

export function showToast(message: string, action?: ToastState['action']) {
  useToast.setState((s) => ({ message, action, key: s.key + 1 }));
}

export function hideToast() {
  useToast.setState({ message: null, action: undefined });
}
