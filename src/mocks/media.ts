import type { AudioSource } from 'expo-audio';

// Mock voice notes (generated with an Indian-English text-to-speech voice).
const voiceNotes: Record<string, AudioSource> = {
  'meena-27aug': require('../../assets/audio/meena-27aug.m4a'),
  'karthik-aug': require('../../assets/audio/karthik-aug.m4a'),
  'rkumar-shop-closed': require('../../assets/audio/rkumar-shop-closed.m4a'),
};

/** Resolves a mock voice-note id or a recorded file uri to something expo-audio can play. */
export function voiceSource(voice: string): AudioSource {
  return voiceNotes[voice] ?? { uri: voice };
}
