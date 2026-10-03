import { createRouter, createWebHistory } from 'vue-router';
import i18n from './i18n.js';
import HomeView from './shared/presentation/views/home-view.vue';
import AboutView from './shared/presentation/views/about-view.vue';
import PageNotFoundView from './shared/presentation/views/page-not-found-view.vue';
import { policyRoutes } from './policy-management/presentation/policy.routes.js';

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
    ...policyRoutes,
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

router.afterEach((to) => {
    const titleKey = to.meta.titleKey ?? 'app.name';
    const pageTitle = i18n.global.t(titleKey);

    document.title = `${pageTitle} | Livva`;
});

export default router;