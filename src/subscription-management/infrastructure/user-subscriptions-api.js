import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class UserSubscriptionsApi extends BaseEndpoint {
    constructor() {
        super(
            import.meta.env
                .VITE_USER_SUBSCRIPTIONS_ENDPOINT_PATH
        );
    }

    getByUserId(userId) {
        return this.getAll({
            userId
        });
    }
}

export default new UserSubscriptionsApi();