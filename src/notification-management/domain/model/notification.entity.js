export class Notification {
    constructor({
                    id,
                    userId,
                    type,
                    policyId,
                    policyNumber,
                    expirationDate,
                    isRead,
                    readAt,
                    createdAt
                }) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.policyId = policyId;
        this.policyNumber = policyNumber;
        this.expirationDate = expirationDate;
        this.isRead = isRead;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }
}