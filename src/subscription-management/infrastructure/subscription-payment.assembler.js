import { SubscriptionPayment } from '../domain/model/subscription-payment.entity.js';

export class SubscriptionPaymentAssembler {
    static toEntity(resource) {
        return new SubscriptionPayment({
            id: resource.id,
            userSubscriptionId:
            resource.userSubscriptionId,
            userId: resource.userId,
            planId: resource.planId,
            provider: resource.provider,
            providerPaymentId:
            resource.providerPaymentId,
            amount: resource.amount,
            currency: resource.currency,
            status: resource.status,
            paidAt: resource.paidAt,
            createdAt: resource.createdAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) =>
            this.toEntity(resource)
        );
    }

    static toResource(subscriptionPayment) {
        return {
            userSubscriptionId:
            subscriptionPayment
                .userSubscriptionId,
            userId: subscriptionPayment.userId,
            planId: subscriptionPayment.planId,
            provider:
            subscriptionPayment.provider,
            providerPaymentId:
            subscriptionPayment
                .providerPaymentId,
            amount: subscriptionPayment.amount,
            currency:
            subscriptionPayment.currency,
            status: subscriptionPayment.status,
            paidAt: subscriptionPayment.paidAt,
            createdAt:
            subscriptionPayment.createdAt
        };
    }
}