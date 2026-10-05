import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class BeneficiariesApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_BENEFICIARIES_ENDPOINT_PATH);
    }
}

export default new BeneficiariesApi();