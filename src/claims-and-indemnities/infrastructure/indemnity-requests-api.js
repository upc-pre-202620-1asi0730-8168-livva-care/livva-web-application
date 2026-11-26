import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class IndemnityRequestsApi extends BaseEndpoint {
    constructor() {
        super(
            import.meta.env.VITE_INDEMNITY_REQUESTS_ENDPOINT_PATH ??
            '/indemnity-requests'
        );
    }

    // The Livva Platform API only lists indemnity requests filtered by policy or beneficiary.
    getByPolicyId(policyId) {
        return this.getAll({ policyId });
    }
}

export default new IndemnityRequestsApi();
