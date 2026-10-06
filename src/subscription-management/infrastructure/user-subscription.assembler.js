import { UserSubscription } from '../domain/model/user-subscription.entity.js';

export class UserSubscriptionAssembler {
    static toEntity(resource) {
        return new UserSubscription({
            id: resource.id,
            userId: resource.userId,
            planId: resource.planId,
            billingCycle: resource.billingCycle,
            status: resource.status,
            startDate: resource.startDate,
            nextBillingDate:
            resource.nextBillingDate,
            cancelledAt: resource.cancelledAt,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) =>
            this.toEntity(resource)
        );
    }

    static toResource(userSubscription) {
        return {
            userId: userSubscription.userId,
            planId: userSubscription.planId,
            billingCycle:
            userSubscription.billingCycle,
            status: userSubscription.status,
            startDate:
            userSubscription.startDate,
            nextBillingDate:
            userSubscription.nextBillingDate,
            cancelledAt:
            userSubscription.cancelledAt,
            createdAt:
            userSubscription.createdAt,
            updatedAt:
            userSubscription.updatedAt
        };
    }
}