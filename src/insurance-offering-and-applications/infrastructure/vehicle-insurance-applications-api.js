import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class VehicleInsuranceApplicationsApi extends BaseEndpoint {
    constructor() {
        super(
            import.meta.env
                .VITE_VEHICLE_INSURANCE_APPLICATIONS_ENDPOINT_PATH
        );
    }
}

export default new VehicleInsuranceApplicationsApi();