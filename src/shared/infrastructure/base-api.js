import axios from 'axios';
import ToastEventBus from 'primevue/toasteventbus';
import authToken from './auth-token.js';
import i18n from '../../i18n.js';

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

    // The API localizes its validation and business messages with this header.
    config.headers['Accept-Language'] = i18n.global.locale.value;

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

const EXPLAINED_STATUSES = new Set([400, 404, 409, 422]);

// Extracts the reason sent by the API as RFC 7807 ProblemDetails, preferring the
// first field validation message over the generic title.
export const getApiErrorMessage = (error) => {
    const problem = error.response?.data;

    if (!problem || typeof problem !== 'object') {
        return null;
    }

    const validationMessages = Object.values(problem.errors ?? {}).flat();

    return validationMessages[0] ?? problem.detail ?? problem.title ?? null;
};

// Every view already reports that an action failed; this adds why it failed, so the
// user knows how to fix it (for example, a license plate that is already registered).
const explainRejectedChange = (error) => {
    const method = error.config?.method?.toLowerCase();

    if (
        !method ||
        method === 'get' ||
        !EXPLAINED_STATUSES.has(error.response?.status)
    ) {
        return;
    }

    const message = getApiErrorMessage(error);

    if (!message) {
        return;
    }

    ToastEventBus.emit('add', {
        group: 'global',
        severity: 'warn',
        summary: i18n.global.t('app.apiErrorSummary'),
        detail: message,
        life: 6000
    });
};

baseApi.interceptors.response.use(
    (response) => response,
    (error) => {
        explainRejectedChange(error);

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