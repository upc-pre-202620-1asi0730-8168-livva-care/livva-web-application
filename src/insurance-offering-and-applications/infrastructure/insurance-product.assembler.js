import { InsuranceProduct } from '../domain/model/insurance-product.entity.js';

export class InsuranceProductAssembler {
    static toEntity(resource) {
        return new InsuranceProduct({
            id: resource.id,
            insurerId: resource.insurerId,
            name: resource.name,
            insuranceType: resource.insuranceType,
            coverageAmount: resource.coverageAmount,
            premiumAmount: resource.premiumAmount,
            active: resource.active,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources = []) {
        return resources.map((resource) => this.toEntity(resource));
    }
}