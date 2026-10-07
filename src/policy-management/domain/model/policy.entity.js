export class Policy {
    constructor({
                    id,
                    userId,
                    applicationId,
                    policyNumber,
                    insuranceType,
                    startDate,
                    expirationDate,
                    premiumAmount,
                    coverageAmount,
                    status,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.userId = userId;
        this.applicationId = applicationId;
        this.policyNumber = policyNumber;
        this.insuranceType = insuranceType;
        this.startDate = startDate;
        this.expirationDate = expirationDate;
        this.premiumAmount = premiumAmount;
        this.coverageAmount = coverageAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}