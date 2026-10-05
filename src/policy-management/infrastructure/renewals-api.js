import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class RenewalsApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_RENEWALS_ENDPOINT_PATH);
    }
}

export default new RenewalsApi();