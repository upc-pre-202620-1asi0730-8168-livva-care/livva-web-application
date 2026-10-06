import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import notificationsApi from '../infrastructure/notifications-api.js';
import { NotificationAssembler } from '../infrastructure/notification.assembler.js';

const EXPIRATION_NOTICE_DAYS = 120;

const getDaysUntilExpiration = (expirationDate) => {
    const [year, month, day] = expirationDate
        .split('-')
        .map(Number);

    const expirationTime = Date.UTC(
        year,
        month - 1,
        day
    );

    const today = new Date();
    const todayTime = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    return Math.ceil(
        (expirationTime - todayTime) /
        (1000 * 60 * 60 * 24)
    );
};

export const useNotificationStore = defineStore(
    'notification-management',
    () => {
        const notifications = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const unreadCount = computed(() =>
            notifications.value.filter(
                (notification) => !notification.isRead
            ).length
        );

        const sortNotifications = (items) =>
            [...items].sort(
                (first, second) =>
                    new Date(second.createdAt) -
                    new Date(first.createdAt)
            );

        const fetchNotifications = async (userId) => {
            loading.value = true;
            error.value = null;

            try {
                const response =
                    await notificationsApi.getAll({
                        userId
                    });

                notifications.value = sortNotifications(
                    NotificationAssembler.toEntities(
                        response.data
                    )
                );
            } catch {
                error.value = 'notifications.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const generateExpirationNotifications = async (
            policies,
            userId
        ) => {
            saving.value = true;
            error.value = null;

            try {
                const response =
                    await notificationsApi.getAll({
                        userId
                    });

                const existingNotifications =
                    NotificationAssembler.toEntities(
                        response.data
                    );

                const existingPolicyIds = new Set(
                    existingNotifications
                        .filter(
                            (notification) =>
                                notification.type ===
                                'policy_expiration'
                        )
                        .map((notification) =>
                            Number(notification.policyId)
                        )
                );

                const expiringPolicies = policies.filter(
                    (policy) => {
                        const daysUntilExpiration =
                            getDaysUntilExpiration(
                                policy.expirationDate
                            );

                        return (
                            Number(policy.userId) ===
                            Number(userId) &&
                            policy.status === 'active' &&
                            daysUntilExpiration >= 0 &&
                            daysUntilExpiration <=
                            EXPIRATION_NOTICE_DAYS &&
                            !existingPolicyIds.has(
                                Number(policy.id)
                            )
                        );
                    }
                );

                const createdNotifications =
                    await Promise.all(
                        expiringPolicies.map(
                            async (policy) => {
                                const resource =
                                    NotificationAssembler
                                        .toResource({
                                            userId,
                                            type:
                                                'policy_expiration',
                                            policyId:
                                            policy.id,
                                            policyNumber:
                                            policy.policyNumber,
                                            expirationDate:
                                            policy.expirationDate,
                                            isRead: false,
                                            readAt: null,
                                            createdAt:
                                                new Date()
                                                    .toISOString()
                                        });

                                const createdResponse =
                                    await notificationsApi
                                        .create(resource);

                                return NotificationAssembler
                                    .toEntity(
                                        createdResponse.data
                                    );
                            }
                        )
                    );

                notifications.value = sortNotifications([
                    ...existingNotifications,
                    ...createdNotifications
                ]);
            } catch {
                error.value =
                    'notifications.errors.generate';
            } finally {
                saving.value = false;
            }
        };

        const markAsRead = async (notificationId) => {
            const notification =
                notifications.value.find(
                    (item) => item.id === notificationId
                );

            if (!notification || notification.isRead) {
                return true;
            }

            error.value = null;

            try {
                const response =
                    await notificationsApi.patch(
                        notificationId,
                        {
                            isRead: true,
                            readAt: new Date().toISOString()
                        }
                    );

                const index =
                    notifications.value.findIndex(
                        (item) =>
                            item.id === notificationId
                    );

                if (index !== -1) {
                    notifications.value[index] =
                        NotificationAssembler.toEntity(
                            response.data
                        );
                }

                return true;
            } catch {
                error.value =
                    'notifications.errors.markAsRead';
                return false;
            }
        };

        const markAllAsRead = async () => {
            saving.value = true;
            error.value = null;

            try {
                const unreadNotifications =
                    notifications.value.filter(
                        (notification) =>
                            !notification.isRead
                    );

                const readAt = new Date().toISOString();

                const responses = await Promise.all(
                    unreadNotifications.map(
                        (notification) =>
                            notificationsApi.patch(
                                notification.id,
                                {
                                    isRead: true,
                                    readAt
                                }
                            )
                    )
                );

                const updatedNotifications =
                    responses.map((response) =>
                        NotificationAssembler.toEntity(
                            response.data
                        )
                    );

                const updatedById = new Map(
                    updatedNotifications.map(
                        (notification) => [
                            notification.id,
                            notification
                        ]
                    )
                );

                notifications.value =
                    notifications.value.map(
                        (notification) =>
                            updatedById.get(
                                notification.id
                            ) ?? notification
                    );

                return true;
            } catch {
                error.value =
                    'notifications.errors.markAllAsRead';
                return false;
            } finally {
                saving.value = false;
            }
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            notifications,
            unreadCount,
            loading,
            saving,
            error,
            fetchNotifications,
            generateExpirationNotifications,
            markAsRead,
            markAllAsRead,
            clearError
        };
    }
);