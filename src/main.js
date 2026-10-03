import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Material from '@primevue/themes/material';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

import App from './app.vue';
import router from './router.js';
import pinia from './pinia.js';
import i18n from './i18n.js';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './style.css';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Material,
        options: {
            darkModeSelector: false
        }
    }
});

app.use(ConfirmationService);
app.use(ToastService);
app.use(router);
app.use(pinia);
app.use(i18n);

app.component('pv-button', Button);
app.component('pv-card', Card);
app.component('pv-column', Column);
app.component('pv-data-table', DataTable);
app.component('pv-message', Message);
app.component('pv-progress-spinner', ProgressSpinner);
app.component('pv-tag', Tag);

app.mount('#app');