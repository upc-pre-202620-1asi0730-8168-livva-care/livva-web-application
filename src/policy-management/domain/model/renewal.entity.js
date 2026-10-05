export class Renewal {
    constructor({
                    id,
                    policyId,
                    requestedAt,
                    status,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.policyId = policyId;
        this.requestedAt = requestedAt;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}