import { Notification } from '../domain/model/notification.entity.js';

export class NotificationAssembler {
    static toEntity(resource) {
        return new Notification({
            id: resource.id,
            userId: resource.userId,
            type: resource.type,
            policyId: resource.policyId,
            policyNumber: resource.policyNumber,
            expirationDate: resource.expirationDate,
            isRead: resource.isRead,
            readAt: resource.readAt,
            createdAt: resource.createdAt
        });
    }

    static toEntities(resources) {
        return resources.map((resource) =>
            this.toEntity(resource)
        );
    }

    static toResource(notification) {
        return {
            userId: notification.userId,
            type: notification.type,
            policyId: notification.policyId,
            policyNumber: notification.policyNumber,
            expirationDate: notification.expirationDate,
            isRead: notification.isRead,
            readAt: notification.readAt,
            createdAt: notification.createdAt
        };
    }
}