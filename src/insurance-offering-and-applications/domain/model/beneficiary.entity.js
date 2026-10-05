export class Beneficiary {
    constructor({
                    id,
                    policyId,
                    fullName,
                    documentType,
                    documentNumber,
                    relationship,
                    birthDate,
                    participationPercentage,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.policyId = policyId;
        this.fullName = fullName;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.relationship = relationship;
        this.birthDate = birthDate;
        this.participationPercentage = participationPercentage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}