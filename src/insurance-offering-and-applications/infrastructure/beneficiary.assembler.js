import { Beneficiary } from '../domain/model/beneficiary.entity.js';

export class BeneficiaryAssembler {
    static toEntity(resource) {
        return new Beneficiary({
            id: resource.id,
            policyId: resource.policyId,
            fullName: resource.fullName,
            documentType: resource.documentType,
            documentNumber: resource.documentNumber,
            relationship: resource.relationship,
            birthDate: resource.birthDate,
            participationPercentage: resource.participationPercentage,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) => this.toEntity(resource));
    }

    static toResource(beneficiary) {
        return {
            policyId: beneficiary.policyId,
            fullName: beneficiary.fullName,
            documentType: beneficiary.documentType,
            documentNumber: beneficiary.documentNumber,
            relationship: beneficiary.relationship,
            birthDate: beneficiary.birthDate,
            participationPercentage: beneficiary.participationPercentage,
            createdAt: beneficiary.createdAt,
            updatedAt: beneficiary.updatedAt
        };
    }
}