import baseApi from '../../shared/infrastructure/base-api.js';

const usersApi = {
    getAll() {
        return baseApi.get('/users');
    },

    getById(id) {
        return baseApi.get(`/users/${id}`);
    },

    getByEmail(email) {
        return baseApi.get('/users', {
            params: {
                email
            }
        });
    },

    create(resource) {
        return baseApi.post('/users', resource);
    },

    update(id, resource) {
        return baseApi.patch(`/users/${id}`, resource);
    }
};

export default usersApi;