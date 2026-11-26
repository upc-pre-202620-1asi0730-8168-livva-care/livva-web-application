import ToastEventBus from 'primevue/toasteventbus';
import i18n from '../../i18n.js';
import insuranceApplicationsApi from '../infrastructure/insurance-applications-api.js';
import policiesApi from '../../policy-management/infrastructure/policies-api.js';
import notificationsApi from '../../notification-management/infrastructure/notifications-api.js';
import { usePolicyStore } from '../../policy-management/application/policy.store.js';
import { useNotificationStore } from '../../notification-management/application/notification.store.js';

export const DEMO_REVIEW_DELAY_MS = 5000;

// Demonstration mode: the insurer portal is part of the product roadmap, so this
// service plays the insurer role. A few seconds after an application is submitted it
// moves it through review, approves it, issues the active policy and notifies the user.
// Disable it with VITE_DEMO_AUTO_APPROVAL=false.
export const isDemoReviewEnabled = () =>
    import.meta.env.VITE_DEMO_AUTO_APPROVAL !== 'false';

const POLICY_PREFIXES = {
    vehicle: 'LIV-VEH',
    life: 'LIV-LIF'
};

const toIsoDate = (date) => date.toISOString().split('T')[0];

const policyPeriod = () => {
    const startDate = new Date();
    const expirationDate = new Date(startDate);

    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    expirationDate.setDate(expirationDate.getDate() - 1);

    return {
        startDate: toIsoDate(startDate),
        expirationDate: toIsoDate(expirationDate)
    };
};

const notify = (severity, key, params) => {
    ToastEventBus.emit('add', {
        group: 'global',
        severity,
        summary: i18n.global.t(`${key}.summary`, params),
        detail: i18n.global.t(`${key}.detail`, params),
        life: 7000
    });
};

const reviewApplication = async ({ application, product, insuranceType }) => {
    await insuranceApplicationsApi.patch(application.id, {
        status: 'under_review'
    });

    await insuranceApplicationsApi.patch(application.id, {
        status: 'approved'
    });

    const { startDate, expirationDate } = policyPeriod();
    // Year plus a five-digit application id never collides with the four-digit
    // numbers of the demonstration policies loaded by the API.
    const policyNumber = [
        POLICY_PREFIXES[insuranceType],
        `${startDate.slice(0, 4)}${String(application.id).padStart(5, '0')}`
    ].join('-');

    const policyResponse = await policiesApi.create({
        userId: application.userId,
        applicationId: application.id,
        policyNumber,
        insuranceType,
        startDate,
        expirationDate,
        premiumAmount: product.premiumAmount,
        coverageAmount: application.requestedCoverage,
        status: 'active'
    });

    await notificationsApi.create({
        userId: application.userId,
        type: 'application_approved',
        policyId: policyResponse.data.id,
        policyNumber,
        expirationDate,
        isRead: false,
        createdAt: new Date().toISOString()
    });

    return policyNumber;
};

export const scheduleDemoInsurerReview = ({
                                              application,
                                              product,
                                              insuranceType,
                                              onReviewed
                                          }) => {
    if (!isDemoReviewEnabled() || !application || !product) {
        return;
    }

    setTimeout(async () => {
        try {
            const policyNumber = await reviewApplication({
                application,
                product,
                insuranceType
            });

            await Promise.all([
                useNotificationStore().fetchNotifications(application.userId),
                usePolicyStore().fetchPolicies(),
                onReviewed?.()
            ]);

            notify('success', 'demoReview.approved', {
                number: application.id,
                policyNumber
            });
        } catch {
            notify('warn', 'demoReview.failed', { number: application.id });
        }
    }, DEMO_REVIEW_DELAY_MS);
};
