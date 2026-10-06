import BaseEndpoint from '../../shared/infrastructure/base-endpoint.js';

class NotificationsApi extends BaseEndpoint {
    constructor() {
        super(import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH);
    }
}

export default new NotificationsApi();