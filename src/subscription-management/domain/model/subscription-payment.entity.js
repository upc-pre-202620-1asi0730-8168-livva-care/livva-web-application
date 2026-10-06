export class SubscriptionPayment {
    constructor({
                    id,
                    userSubscriptionId,
                    userId,
                    planId,
                    provider,
                    providerPaymentId,
                    amount,
                    currency,
                    status,
                    paidAt,
                    createdAt
                }) {
        this.id = id;
        this.userSubscriptionId =
            userSubscriptionId;

        this.userId = userId;
        this.planId = planId;
        this.provider = provider;
        this.providerPaymentId =
            providerPaymentId;

        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
    }
}