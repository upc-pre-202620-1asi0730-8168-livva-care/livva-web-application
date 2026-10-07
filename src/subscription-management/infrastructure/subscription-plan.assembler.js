import { SubscriptionPlan } from '../domain/model/subscription-plan.entity.js';

export class SubscriptionPlanAssembler {
    static toEntity(resource) {
        return new SubscriptionPlan({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            monthlyPrice: resource.monthlyPrice,
            annualPrice: resource.annualPrice,
            benefits: resource.benefits ?? [],
            active: resource.active,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) =>
            this.toEntity(resource)
        );
    }

    static toResource(subscriptionPlan) {
        return {
            name: subscriptionPlan.name,
            description:
            subscriptionPlan.description,
            monthlyPrice:
            subscriptionPlan.monthlyPrice,
            annualPrice:
            subscriptionPlan.annualPrice,
            benefits:
                subscriptionPlan.benefits ?? [],
            active: subscriptionPlan.active,
            createdAt:
            subscriptionPlan.createdAt,
            updatedAt:
            subscriptionPlan.updatedAt
        };
    }
}