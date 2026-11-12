const TOKEN_KEY = 'livva-token';

export const authToken = {
    get() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    },

    set(token) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            // Storage can be unavailable (private mode); the session then lasts until reload.
        }
    },

    clear() {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            // Nothing to clear when storage is unavailable.
        }
    },

    authorizationHeader() {
        const token = this.get();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
};

export default authToken;