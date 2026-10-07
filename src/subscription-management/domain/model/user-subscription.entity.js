export class UserSubscription {
    constructor({
                    id,
                    userId,
                    planId,
                    billingCycle,
                    status,
                    startDate,
                    nextBillingDate,
                    cancelledAt,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.userId = userId;
        this.planId = planId;
        this.billingCycle = billingCycle;
        this.status = status;
        this.startDate = startDate;
        this.nextBillingDate = nextBillingDate;
        this.cancelledAt = cancelledAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}