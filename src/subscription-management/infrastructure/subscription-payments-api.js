import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class SubscriptionPaymentsApi extends BaseEndpoint {
    constructor() {
        super(
            import.meta.env
                .VITE_SUBSCRIPTION_PAYMENTS_ENDPOINT_PATH
        );
    }

    getByUserId(userId) {
        return this.getAll({
            userId
        });
    }

    getBySubscriptionId(userSubscriptionId) {
        return this.getAll({
            userSubscriptionId
        });
    }
}

export default new SubscriptionPaymentsApi();