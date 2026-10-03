export class InsuranceApplication {
    constructor({
                    id,
                    userId,
                    productId,
                    requestedCoverage,
                    status,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.userId = userId;
        this.productId = productId;
        this.requestedCoverage = requestedCoverage;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}