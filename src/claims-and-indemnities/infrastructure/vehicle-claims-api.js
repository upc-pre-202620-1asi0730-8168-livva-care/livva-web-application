import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class VehicleClaimsApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_VEHICLE_CLAIMS_ENDPOINT_PATH);
    }
}

export default new VehicleClaimsApi();