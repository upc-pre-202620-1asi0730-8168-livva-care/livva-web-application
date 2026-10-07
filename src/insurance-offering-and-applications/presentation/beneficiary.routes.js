import BeneficiaryListView from './views/beneficiary-list-view.vue';

export const beneficiaryRoutes = [
    {
        path: '/beneficiaries',
        name: 'beneficiaries',
        component: BeneficiaryListView,
        meta: {
            titleKey: 'beneficiaries.pageTitle'
        }
    }
];