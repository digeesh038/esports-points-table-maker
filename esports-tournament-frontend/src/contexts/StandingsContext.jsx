import React, { createContext, useContext, useState } from 'react';

const StandingsContext = createContext();

export const useStandings = () => {
    const context = useContext(StandingsContext);
    if (!context) {
        throw new Error('useStandings must be used within a StandingsProvider');
    }
    return context;
};

export const StandingsProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [id, setId] = useState(null);

    const openStandings = (tournamentId = null) => {
        setId(tournamentId);
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeStandings = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <StandingsContext.Provider value={{ isOpen, id, openStandings, closeStandings }}>
            {children}
        </StandingsContext.Provider>
    );
};
