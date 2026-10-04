import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class LifeInsuranceApplicationsApi extends BaseEndpoint {
    constructor() {
        super(
            import.meta.env
                .VITE_LIFE_INSURANCE_APPLICATIONS_ENDPOINT_PATH
        );
    }
}

export default new LifeInsuranceApplicationsApi();