import baseApi from '../../shared/infrastructure/base-api.js';

const authenticationApi = {
    signUp(resource) {
        return baseApi.post('/authentication/sign-up', resource);
    },

    signIn(resource) {
        return baseApi.post('/authentication/sign-in', resource);
    }
};

export default authenticationApi;