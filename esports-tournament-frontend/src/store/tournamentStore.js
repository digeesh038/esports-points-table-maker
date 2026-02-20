import { create } from 'zustand';

export const useTournamentStore = create((set) => ({
    selectedTournament: null,
    selectedStage: null,

    setSelectedTournament: (tournament) => set({ selectedTournament: tournament }),
    setSelectedStage: (stage) => set({ selectedStage: stage }),
    clearSelection: () => set({ selectedTournament: null, selectedStage: null }),
}));