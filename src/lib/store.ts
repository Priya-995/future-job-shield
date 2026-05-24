import { create } from "zustand";

export type RecruiterInput = {
  company: string;
  jobTitle: string;
  salary: string;
  website: string;
  description: string;
};

type Store = {
  input: RecruiterInput | null;
  setInput: (i: RecruiterInput) => void;
};

export const useAnalysisStore = create<Store>((set) => ({
  input: null,
  setInput: (input) => set({ input }),
}));
