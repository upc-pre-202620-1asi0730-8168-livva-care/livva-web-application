import { Vehicle } from '../domain/model/vehicle.entity.js';

export class VehicleAssembler {
    static toEntity(resource) {
        return new Vehicle({
            id: resource.id,
            userId: resource.userId,
            licensePlate: resource.licensePlate,
            brand: resource.brand,
            model: resource.model,
            manufactureYear: resource.manufactureYear,
            estimatedValue: resource.estimatedValue,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(vehicle) {
        return {
            userId: vehicle.userId,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            manufactureYear: vehicle.manufactureYear,
            estimatedValue: vehicle.estimatedValue
        };
    }
}