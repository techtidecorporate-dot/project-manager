import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
    ADMIN: 'ADMIN',
    CLIENT: 'CLIENT',
    PM: 'PM',
    DEVELOPER: 'DEVELOPER',
    SQA: 'SQA',
};

// Mock user for testing - you can change this to null to test login
const initialState = {
    user: null,
    isAuthenticated: false,
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setAuthState({ user: data, isAuthenticated: true });
                // Store token in localStorage
                localStorage.setItem('user', JSON.stringify(data));
                setLoading(false);
                return data;
            } else {
                setLoading(false);
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            setLoading(false);
            console.error('Login error:', error);
            throw error;
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.token) {
                    setAuthState({ user: parsedUser, isAuthenticated: true });
                } else {
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setAuthState({ user: null, isAuthenticated: false });
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
