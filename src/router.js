import { createRouter, createWebHistory } from 'vue-router';
import i18n from './i18n.js';

import HomeView from './shared/presentation/views/home-view.vue';
import AboutView from './shared/presentation/views/about-view.vue';
import PageNotFoundView from './shared/presentation/views/page-not-found-view.vue';

import { policyRoutes } from './policy-management/presentation/policy.routes.js';
import { vehicleRoutes } from './insurance-offering-and-applications/presentation/vehicle.routes.js';
import { lifeRoutes } from './insurance-offering-and-applications/presentation/life.routes.js';
import { beneficiaryRoutes } from './insurance-offering-and-applications/presentation/beneficiary.routes.js';
import { vehicleClaimRoutes } from './claims-and-indemnities/presentation/vehicle-claim.routes.js';
import { identityRoutes } from './identity-and-profile-management/presentation/identity.routes.js';
import { notificationRoutes } from './notification-management/presentation/notification.routes.js';
import { authenticationGuard } from './identity-and-profile-management/presentation/auth.guard.js';
import { subscriptionRoutes } from './subscription-management/presentation/subscription.routes.js';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            titleKey: 'home.pageTitle'
        }
    },
    {
        path: '/about',
        name: 'about',
        component: AboutView,
        meta: {
            titleKey: 'about.pageTitle'
        }
    },

    ...identityRoutes,
    ...vehicleRoutes,
    ...lifeRoutes,
    ...beneficiaryRoutes,
    ...vehicleClaimRoutes,
    ...policyRoutes,
    ...notificationRoutes,
    ...subscriptionRoutes,

    {
        path: '/:pathMatch(.*)*',
        name: 'page-not-found',
        component: PageNotFoundView,
        meta: {
            titleKey: 'notFound.pageTitle'
        }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return {
            top: 0
        };
    }
});

router.beforeEach(authenticationGuard);

router.afterEach((to) => {
    const titleKey =
        to.meta.titleKey ?? 'app.name';

    const pageTitle =
        i18n.global.t(titleKey);

    document.title =
        `${pageTitle} | Livva`;
});

export default router;