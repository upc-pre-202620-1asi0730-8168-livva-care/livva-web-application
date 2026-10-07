<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import { useNotificationStore } from '../../application/notification.store.js';

const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();

const notificationStore = useNotificationStore();

const {
  notifications,
  unreadCount,
  loading: notificationsLoading,
  saving,
  error: notificationError
} = storeToRefs(notificationStore);

const loading = computed(
    () =>
        notificationsLoading.value ||
        saving.value
);

const pageError = computed(
    () => notificationError.value
);

const formatDate = (date) => {
  if (!date) {
    return '—';
  }

  const normalizedDate = date.includes('T')
      ? date
      : `${date}T00:00:00`;

  return new Intl.DateTimeFormat(
      locale.value === 'es' ? 'es-PE' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
  ).format(new Date(normalizedDate));
};

const formatDateTime = (date) => {
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(
      locale.value === 'es' ? 'es-PE' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
  ).format(new Date(date));
};

const getNotificationMessage = (notification) => {
  if (notification.type === 'policy_expiration') {
    return t(
        'notifications.types.policyExpiration',
        {
          policyNumber:
          notification.policyNumber,
          expirationDate:
              formatDate(
                  notification.expirationDate
              )
        }
    );
  }

  return t('notifications.types.default');
};

const openNotification = async (notification) => {
  const successful =
      await notificationStore.markAsRead(
          notification.id
      );

  if (!successful) {
    toast.add({
      severity: 'error',
      summary: t(
          notificationError.value ??
          'notifications.errors.markAsRead'
      ),
      life: 3500
    });

    notificationStore.clearError();
    return;
  }

  if (
      notification.type === 'policy_expiration' &&
      notification.policyId
  ) {
    await router.push({
      name: 'policy-detail',
      params: {
        id: notification.policyId
      }
    });
  }
};

const markAllNotificationsAsRead = async () => {
  const successful =
      await notificationStore.markAllAsRead();

  if (!successful) {
    toast.add({
      severity: 'error',
      summary: t(
          notificationError.value ??
          'notifications.errors.markAllAsRead'
      ),
      life: 3500
    });

    notificationStore.clearError();
    return;
  }

  toast.add({
    severity: 'success',
    summary: t(
        'notifications.messages.allMarkedAsRead'
    ),
    life: 3000
  });
};
</script>

<template>
  <main class="vehicles-page notifications-page">
    <pv-toast />

    <header class="vehicles-page__heading">
      <div class="vehicles-page__header">
        <span class="section-label">
          {{ t('notifications.sectionLabel') }}
        </span>

        <h1>{{ t('notifications.title') }}</h1>

        <p>{{ t('notifications.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-check"
          :label="
            t('notifications.actions.markAllAsRead')
          "
          :disabled="
            unreadCount === 0 ||
            loading ||
            saving
          "
          :loading="saving"
          @click="markAllNotificationsAsRead"
      />
    </header>

    <div class="notifications-summary">
      <i class="pi pi-bell"></i>

      <span>
        {{
          t(
              'notifications.unreadSummary',
              { count: unreadCount },
              unreadCount
          )
        }}
      </span>
    </div>

    <div v-if="loading" class="vehicles-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading notifications"
      />
    </div>

    <pv-message
        v-else-if="pageError"
        severity="error"
        :closable="false"
    >
      {{ t(pageError) }}
    </pv-message>

    <pv-data-table
        v-else
        :value="notifications"
        paginator
        :rows="5"
        striped-rows
        responsive-layout="scroll"
        class="vehicles-table"
        data-key="id"
    >
      <template #empty>
        <div class="vehicles-state">
          <i class="pi pi-bell"></i>

          <p>{{ t('notifications.empty') }}</p>
        </div>
      </template>

      <pv-column
          :header="t('notifications.fields.status')"
      >
        <template #body="{ data }">
          <pv-tag
              :value="
                data.isRead
                    ? t('notifications.statuses.read')
                    : t('notifications.statuses.unread')
              "
              :severity="
                data.isRead
                    ? 'secondary'
                    : 'info'
              "
          />
        </template>
      </pv-column>

      <pv-column
          :header="t('notifications.fields.message')"
      >
        <template #body="{ data }">
          <div
              class="notification-message"
              :class="{
                'notification-message--unread':
                    !data.isRead
              }"
          >
            <i class="pi pi-calendar-clock"></i>

            <span>
              {{ getNotificationMessage(data) }}
            </span>
          </div>
        </template>
      </pv-column>

      <pv-column
          :header="t('notifications.fields.createdAt')"
      >
        <template #body="{ data }">
          {{ formatDateTime(data.createdAt) }}
        </template>
      </pv-column>

      <pv-column
          :header="t('notifications.actions.column')"
      >
        <template #body="{ data }">
          <pv-button
              icon="pi pi-eye"
              severity="secondary"
              text
              :label="
                t('notifications.actions.view')
              "
              @click="openNotification(data)"
          />
        </template>
      </pv-column>
    </pv-data-table>
  </main>
</template>

<style scoped>
.notifications-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.85rem 1rem;
  color: #08204a;
  background: #e8f2ff;
  border-radius: 0.75rem;
  font-weight: 600;
}

.notifications-summary .pi {
  color: #0f5cf6;
  font-size: 1.15rem;
}

.notification-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 22rem;
  color: #334155;
}

.notification-message--unread {
  color: #08204a;
  font-weight: 700;
}

.notification-message .pi {
  color: #0f5cf6;
  font-size: 1.15rem;
}

@media (max-width: 768px) {
  .notification-message {
    min-width: 16rem;
  }
}
</style>