import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class InsurersApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_INSURERS_ENDPOINT_PATH);
    }
}

export default new InsurersApi();