import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class VehiclesApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_VEHICLES_ENDPOINT_PATH);
    }
}

export default new VehiclesApi();