import baseApi from './base-api.js';

export class BaseEndpoint {
    constructor(resourcePath) {
        this.resourcePath = resourcePath;
    }

    getAll(params = {}) {
        return baseApi.get(this.resourcePath, { params });
    }

    getById(id) {
        return baseApi.get(`${this.resourcePath}/${id}`);
    }

    create(resource) {
        return baseApi.post(this.resourcePath, resource);
    }

    update(id, resource) {
        return baseApi.put(`${this.resourcePath}/${id}`, resource);
    }

    patch(id, attributes) {
        return baseApi.patch(`${this.resourcePath}/${id}`, attributes);
    }

    delete(id) {
        return baseApi.delete(`${this.resourcePath}/${id}`);
    }
}

export default BaseEndpoint;