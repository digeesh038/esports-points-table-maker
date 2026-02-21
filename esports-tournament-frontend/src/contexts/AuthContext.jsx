import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔄 Restore session
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    // ✅ GOOGLE LOGIN (only authentication method)
    const googleLogin = async (credential) => {
        try {
            const response = await authAPI.googleSignIn(credential);

            console.log("Google backend response:", response);

            if (!response.success || !response.data) {
                return {
                    success: false,
                    error: response.message || "Invalid response from server",
                };
            }

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);

            return { success: true };

        } catch (err) {
            console.error("Google login error:", err);
            return {
                success: false,
                error: err.response?.data?.message || "Google sign-in failed",
            };
        }
    };


    // 🎭 GUEST LOGIN
    const guestLogin = () => {
        const guestUser = {
            id: 'guest_user',
            name: 'Guest Explorer',
            email: 'guest@example.com',
            role: 'guest',
            isGuest: true
        };
        localStorage.setItem('user', JSON.stringify(guestUser));
        // Note: No token for guest
        setUser(guestUser);
        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                isGuest: user?.isGuest || false,
                googleLogin,
                guestLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
