import axios from 'axios';
import authToken from './auth-token.js';

const baseApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Send the JWT issued by the Livva Platform API on every request.
baseApi.interceptors.request.use((config) => {
    const token = authToken.get();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const AUTHENTICATION_PATH = '/authentication/';

let sessionExpirationInProgress = false;

// When the API rejects the stored JWT, close the session and send the user to sign in
// again with a clear explanation instead of leaving every view with a generic error.
const handleExpiredSession = async () => {
    if (sessionExpirationInProgress) {
        return;
    }

    sessionExpirationInProgress = true;

    try {
        const [{ useUserStore }, { default: router }] = await Promise.all([
            import('../../identity-and-profile-management/application/user.store.js'),
            import('../../router.js')
        ]);

        useUserStore().logout();

        // Read the address bar, because the router may still be resolving the requested page.
        const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
        const requestedPath =
            window.location.pathname.slice(basePath.length) + window.location.search;

        if (router.currentRoute.value.name !== 'login') {
            await router.push({
                name: 'login',
                query: {
                    reason: 'session-expired',
                    redirect: requestedPath || '/'
                }
            });
        }
    } finally {
        sessionExpirationInProgress = false;
    }
};

baseApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthenticationRequest =
            error.config?.url?.startsWith(AUTHENTICATION_PATH);

        if (
            error.response?.status === 401 &&
            !isAuthenticationRequest &&
            authToken.get()
        ) {
            handleExpiredSession();
        }

        return Promise.reject(error);
    }
);

export default baseApi;