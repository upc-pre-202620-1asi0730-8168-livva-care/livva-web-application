import { VehicleClaim } from '../domain/model/vehicle-claim.entity.js';

export class VehicleClaimAssembler {
    static toEntity(resource) {
        return new VehicleClaim({
            id: resource.id,
            policyId: resource.policyId,
            incidentDate: resource.incidentDate,
            incidentLocation: resource.incidentLocation,
            description: resource.description,
            estimatedDamageAmount: resource.estimatedDamageAmount,
            status: resource.status,
            reportedAt: resource.reportedAt,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(vehicleClaim) {
        return {
            policyId: vehicleClaim.policyId,
            incidentDate: vehicleClaim.incidentDate,
            incidentLocation: vehicleClaim.incidentLocation,
            description: vehicleClaim.description,
            estimatedDamageAmount: vehicleClaim.estimatedDamageAmount,
            status: vehicleClaim.status,
            reportedAt: vehicleClaim.reportedAt,
            createdAt: vehicleClaim.createdAt,
            updatedAt: vehicleClaim.updatedAt
        };
    }
}