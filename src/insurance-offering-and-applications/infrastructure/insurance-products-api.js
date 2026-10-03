import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class InsuranceProductsApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_INSURANCE_PRODUCTS_ENDPOINT_PATH);
    }
}

export default new InsuranceProductsApi();