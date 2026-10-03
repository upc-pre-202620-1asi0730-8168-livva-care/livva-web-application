import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class InsuranceApplicationsApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_INSURANCE_APPLICATIONS_ENDPOINT_PATH);
    }
}

export default new InsuranceApplicationsApi();