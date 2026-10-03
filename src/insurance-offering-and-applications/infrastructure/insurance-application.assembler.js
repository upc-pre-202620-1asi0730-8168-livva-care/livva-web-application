import { InsuranceApplication } from '../domain/model/insurance-application.entity.js';

export class InsuranceApplicationAssembler {
    static toEntity(resource) {
        return new InsuranceApplication({
            id: resource.id,
            userId: resource.userId,
            productId: resource.productId,
            requestedCoverage: resource.requestedCoverage,
            status: resource.status,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources = []) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(application) {
        return {
            userId: application.userId,
            productId: application.productId,
            requestedCoverage: application.requestedCoverage,
            status: application.status,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
        };
    }
}