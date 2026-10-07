import { VehicleInsuranceApplication } from '../domain/model/vehicle-insurance-application.entity.js';

export class VehicleInsuranceApplicationAssembler {
    static toEntity(resource) {
        return new VehicleInsuranceApplication({
            applicationId: resource.applicationId,
            vehicleId: resource.vehicleId
        });
    }

    static toEntities(resources = []) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(application) {
        return {
            applicationId: application.applicationId,
            vehicleId: application.vehicleId
        };
    }
}