export class ClaimStatusHistory {
    constructor({
                    id,
                    claimId,
                    status,
                    comment,
                    changedAt,
                    createdAt
                }) {
        this.id = id;
        this.claimId = claimId;
        this.status = status;
        this.comment = comment;
        this.changedAt = changedAt;
        this.createdAt = createdAt;
    }
}