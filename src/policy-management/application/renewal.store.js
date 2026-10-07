import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import renewalsApi from '../infrastructure/renewals-api.js';
import { RenewalAssembler } from '../infrastructure/renewal.assembler.js';

export const useRenewalStore = defineStore(
    'policy-renewal',
    () => {
        const renewals = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const latestRenewal = computed(() =>
            renewals.value.length > 0
                ? renewals.value[0]
                : null
        );

        const hasPendingRenewal = computed(() =>
            renewals.value.some((renewal) =>
                ['pending', 'under_review'].includes(
                    renewal.status
                )
            )
        );

        const fetchRenewals = async (policyId) => {
            loading.value = true;
            error.value = null;

            try {
                const response = await renewalsApi.getAll({
                    policyId
                });

                renewals.value = RenewalAssembler
                    .toEntities(response.data)
                    .sort(
                        (first, second) =>
                            new Date(second.requestedAt) -
                            new Date(first.requestedAt)
                    );
            } catch {
                error.value = 'renewals.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const createRenewal = async (policyId) => {
            if (hasPendingRenewal.value) {
                error.value = 'renewals.errors.duplicate';
                return null;
            }

            saving.value = true;
            error.value = null;

            try {
                const now = new Date().toISOString();

                const resource = RenewalAssembler.toResource({
                    policyId,
                    requestedAt: now,
                    status: 'pending',
                    createdAt: now,
                    updatedAt: now
                });

                const response = await renewalsApi.create(resource);
                const createdRenewal =
                    RenewalAssembler.toEntity(response.data);

                renewals.value.unshift(createdRenewal);

                return createdRenewal;
            } catch {
                error.value = 'renewals.errors.create';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const clearRenewals = () => {
            renewals.value = [];
            error.value = null;
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            renewals,
            latestRenewal,
            hasPendingRenewal,
            loading,
            saving,
            error,
            fetchRenewals,
            createRenewal,
            clearRenewals,
            clearError
        };
    }
);