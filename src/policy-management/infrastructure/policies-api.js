import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';
import baseApi from '../../shared/infrastructure/base-api.js';

class PoliciesApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_POLICIES_ENDPOINT_PATH);
    }

    getCoverages(policyId) {
        return baseApi.get(
            import.meta.env.VITE_POLICY_COVERAGES_ENDPOINT_PATH,
            {
                params: { policyId }
            }
        );
    }

    getDocuments(policyId) {
        return baseApi.get(
            import.meta.env.VITE_POLICY_DOCUMENTS_ENDPOINT_PATH,
            {
                params: { policyId }
            }
        );
    }
}

export default new PoliciesApi();