import { useState, useCallback, useEffect, useRef } from 'react';
import type { AudioItem } from '../types';

const STORAGE_KEY = 'genesis_audio_library';
const AUDIO_STORAGE_KEY = 'genesis_audio_blobs';

export const useAudioLibrary = () => {
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load audios from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAudios(parsed);
      }
    } catch (e) {
      console.error('Error loading audio library:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save audios to localStorage
  const saveAudios = useCallback((newAudios: AudioItem[]) => {
    setAudios(newAudios);
    // Save metadata only (not blobs)
    const metadata = newAudios.map(({ audioBlob, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      
      setRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback((): Promise<{ blob: Blob; duration: number } | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      const duration = recordingTime;
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        resolve({ blob, duration });
      };
      
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setRecording(false);
      setRecordingTime(0);
    });
  }, [recordingTime]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    audioChunksRef.current = [];
    setRecording(false);
    setRecordingTime(0);
  }, []);

  // Save audio to library
  const saveAudio = useCallback(async (
    blob: Blob,
    name: string,
    duration: number,
    description?: string,
    tags: string[] = []
  ): Promise<AudioItem> => {
    // Convert blob to base64 for storage
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    
    const newAudio: AudioItem = {
      id: `audio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      description,
      audioUrl: base64,
      duration,
      createdAt: new Date().toISOString(),
      tags,
      usageCount: 0
    };
    
    saveAudios([newAudio, ...audios]);
    return newAudio;
  }, [audios, saveAudios]);

  // Delete audio
  const deleteAudio = useCallback((audioId: string) => {
    saveAudios(audios.filter(a => a.id !== audioId));
  }, [audios, saveAudios]);

  // Update audio
  const updateAudio = useCallback((audioId: string, updates: Partial<AudioItem>) => {
    saveAudios(audios.map(a => 
      a.id === audioId ? { ...a, ...updates } : a
    ));
  }, [audios, saveAudios]);

  // Play audio
  const playAudio = useCallback((audioId: string) => {
    const audio = audios.find(a => a.id === audioId);
    if (!audio) return;
    
    // Stop current playing
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    
    const audioElement = new Audio(audio.audioUrl);
    audioElement.onended = () => {
      setPlaying(null);
      audioElementRef.current = null;
    };
    
    audioElement.play();
    audioElementRef.current = audioElement;
    setPlaying(audioId);
  }, [audios]);

  // Stop playing
  const stopPlaying = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setPlaying(null);
  }, []);

  // Increment usage count
  const incrementUsage = useCallback((audioId: string) => {
    const audio = audios.find(a => a.id === audioId);
    if (audio) {
      updateAudio(audioId, { usageCount: audio.usageCount + 1 });
    }
  }, [audios, updateAudio]);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  return {
    audios,
    recording,
    recordingTime,
    playing,
    loading,
    startRecording,
    stopRecording,
    cancelRecording,
    saveAudio,
    deleteAudio,
    updateAudio,
    playAudio,
    stopPlaying,
    incrementUsage,
    formatDuration
  };
};
