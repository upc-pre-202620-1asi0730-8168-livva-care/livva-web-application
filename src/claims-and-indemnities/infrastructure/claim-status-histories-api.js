import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class ClaimStatusHistoriesApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_CLAIM_STATUS_HISTORIES_ENDPOINT_PATH);
    }
}

export default new ClaimStatusHistoriesApi();