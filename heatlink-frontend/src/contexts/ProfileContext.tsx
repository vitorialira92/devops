import React, { createContext, useContext, useEffect, useState } from 'react';

interface Profile {
    id: number;
    name: string;
    imageUrl: string;
}

interface ProfileContextType {
    profile: Profile;
    refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILES: Profile[] = [
    {
        id: 1,
        name: 'Karina',
        imageUrl: '/1-karina.png',
    },
    {
        id: 2,
        name: 'Karina',
        imageUrl: '/2-karina.png',
    },
    {
        id: 3,
        name: 'Ningning',
        imageUrl: '/1-ningning.png',
    },
    {
        id: 4,
        name: 'Ningning',
        imageUrl: '/2-ningning.png',
    },
    {
        id: 5,
        name: 'Winter',
        imageUrl: '/1-winter.png',
    },
    {
        id: 6,
        name: 'Winter',
        imageUrl: '/2-winter.png',
    },
    {
        id: 7,
        name: 'Giselle',
        imageUrl: '/1-giselle.png',
    },
    {
        id: 8,
        name: 'Giselle',
        imageUrl: '/2-giselle.png',
    },
    {
        id: 9,
        name: 'Ningning',
        imageUrl: '/3-ningning.png',
    },
];

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile>(PROFILES[0]);

    const getRandomProfile = () => {
        const randomIndex = Math.floor(Math.random() * PROFILES.length);
        return PROFILES[randomIndex];
    };

    const refreshProfile = () => {
        setProfile(getRandomProfile());
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, refreshProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within ProfileProvider');
    }
    return context;
}