import { Renewal } from '../domain/model/renewal.entity.js';

export class RenewalAssembler {
    static toEntity(resource) {
        return new Renewal({
            id: resource.id,
            policyId: resource.policyId,
            requestedAt: resource.requestedAt,
            status: resource.status,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(renewal) {
        return {
            policyId: renewal.policyId,
            requestedAt: renewal.requestedAt,
            status: renewal.status,
            createdAt: renewal.createdAt,
            updatedAt: renewal.updatedAt
        };
    }
}