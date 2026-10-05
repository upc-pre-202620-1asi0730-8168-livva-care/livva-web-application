import baseApi from '../../shared/infrastructure/base-api.js';

const userProfilesApi = {
    getAll() {
        return baseApi.get('/user-profiles');
    },

    getById(id) {
        return baseApi.get(`/user-profiles/${id}`);
    },

    getByUserId(userId) {
        return baseApi.get('/user-profiles', {
            params: {
                userId
            }
        });
    },

    create(resource) {
        return baseApi.post('/user-profiles', resource);
    },

    update(id, resource) {
        return baseApi.patch(`/user-profiles/${id}`, resource);
    }
};

export default userProfilesApi;