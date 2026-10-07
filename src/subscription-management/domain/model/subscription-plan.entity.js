export class SubscriptionPlan {
    constructor({
                    id,
                    name,
                    description,
                    monthlyPrice,
                    annualPrice,
                    benefits,
                    active,
                    createdAt,
                    updatedAt
                }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.annualPrice = annualPrice;
        this.benefits = benefits;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}