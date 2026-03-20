import { create } from 'zustand';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5';
export type Alignment = 'left' | 'center' | 'right';

export interface EditorState {
  // Text Properties
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: Alignment;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textShadow: boolean;
  shadowColor: string;
  letterSpacing: number;
  lineHeight: number;
  textBgColor: string;
  textBgOpacity: number;
  position: { x: number; y: number };

  // Background Properties
  backgroundImage: string | null;
  backgroundColor: string; // Hex or gradient string
  overlayOpacity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  aspectRatio: AspectRatio;

  // Actions
  updateTextProperty: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  updateBackgroundProperty: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  setImage: (dataUrl: string | null) => void;
  setAllState: (state: Partial<EditorState>) => void;
  reset: () => void;
}

const initialState = {
  text: "Write your inspiring quote here...",
  fontFamily: "Inter",
  fontSize: 32,
  color: "#ffffff",
  textAlign: "center" as Alignment,
  fontWeight: "bold" as const,
  fontStyle: "normal" as const,
  textShadow: true,
  shadowColor: "#000000",
  letterSpacing: 0,
  lineHeight: 1.2,
  textBgColor: "#000000",
  textBgOpacity: 0,
  position: { x: 0, y: 0 },

  backgroundImage: null,
  backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  overlayOpacity: 20,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  aspectRatio: "1:1" as AspectRatio,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,
  
  updateTextProperty: (key, value) => set((state) => ({ ...state, [key]: value })),
  updateBackgroundProperty: (key, value) => set((state) => ({ ...state, [key]: value })),
  setImage: (dataUrl) => set({ backgroundImage: dataUrl }),
  setAllState: (newState) => set((state) => ({ ...state, ...newState })),
  reset: () => set(initialState),
}));
