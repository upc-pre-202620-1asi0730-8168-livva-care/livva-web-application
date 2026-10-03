import { Policy } from '../domain/model/policy.entity.js';

export class PolicyAssembler {
    static toEntity(resource) {
        return new Policy({
            id: resource.id,
            userId: resource.userId,
            applicationId: resource.applicationId,
            policyNumber: resource.policyNumber,
            insuranceType: resource.insuranceType,
            startDate: resource.startDate,
            expirationDate: resource.expirationDate,
            premiumAmount: resource.premiumAmount,
            coverageAmount: resource.coverageAmount,
            status: resource.status,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }
}