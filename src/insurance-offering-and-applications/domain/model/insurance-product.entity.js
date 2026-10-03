export class InsuranceProduct {
    constructor({
                    id,
                    insurerId,
                    name,
                    insuranceType,
                    coverageAmount,
                    premiumAmount,
                    active,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.insurerId = insurerId;
        this.name = name;
        this.insuranceType = insuranceType;
        this.coverageAmount = coverageAmount;
        this.premiumAmount = premiumAmount;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}