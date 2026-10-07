import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class SubscriptionPlansApi extends BaseEndpoint {
    constructor() {
        super(
            import.meta.env
                .VITE_SUBSCRIPTION_PLANS_ENDPOINT_PATH
        );
    }

    getActivePlans() {
        return this.getAll({
            active: true
        });
    }
}

export default new SubscriptionPlansApi();