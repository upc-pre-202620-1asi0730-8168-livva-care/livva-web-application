import { ref } from 'vue';
import { defineStore } from 'pinia';
import beneficiariesApi from '../infrastructure/beneficiaries-api.js';
import { BeneficiaryAssembler } from '../infrastructure/beneficiary.assembler.js';

export const useBeneficiaryStore = defineStore(
    'beneficiary-management',
    () => {
        const beneficiaries = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const fetchBeneficiaries = async (policyIds = []) => {
            loading.value = true;
            error.value = null;

            try {
                const response = await beneficiariesApi.getAll();
                const entities = BeneficiaryAssembler.toEntities(
                    response.data
                );

                const allowedPolicyIds = new Set(
                    policyIds.map((id) => Number(id))
                );

                beneficiaries.value = allowedPolicyIds.size
                    ? entities.filter((beneficiary) =>
                        allowedPolicyIds.has(
                            Number(beneficiary.policyId)
                        )
                    )
                    : entities;
            } catch {
                error.value = 'beneficiaries.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const createBeneficiary = async (beneficiary) => {
            saving.value = true;
            error.value = null;

            try {
                const now = new Date().toISOString();

                const resource = BeneficiaryAssembler.toResource({
                    ...beneficiary,
                    createdAt: now,
                    updatedAt: now
                });

                const response = await beneficiariesApi.create(resource);
                const createdBeneficiary =
                    BeneficiaryAssembler.toEntity(response.data);

                beneficiaries.value.push(createdBeneficiary);

                return createdBeneficiary;
            } catch {
                error.value = 'beneficiaries.errors.create';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const updateBeneficiary = async (
            beneficiaryId,
            beneficiary
        ) => {
            saving.value = true;
            error.value = null;

            try {
                const currentBeneficiary =
                    beneficiaries.value.find(
                        (item) => item.id === beneficiaryId
                    );

                if (!currentBeneficiary) {
                    error.value = 'beneficiaries.errors.notFound';
                    return null;
                }

                const resource = BeneficiaryAssembler.toResource({
                    ...currentBeneficiary,
                    ...beneficiary,
                    updatedAt: new Date().toISOString()
                });

                const response = await beneficiariesApi.patch(
                    beneficiaryId,
                    resource
                );

                const updatedBeneficiary =
                    BeneficiaryAssembler.toEntity(response.data);

                const index = beneficiaries.value.findIndex(
                    (item) => item.id === beneficiaryId
                );

                if (index !== -1) {
                    beneficiaries.value[index] = updatedBeneficiary;
                }

                return updatedBeneficiary;
            } catch {
                error.value = 'beneficiaries.errors.update';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const getAssignedPercentage = (
            policyId,
            excludedBeneficiaryId = null
        ) => beneficiaries.value
            .filter((beneficiary) =>
                Number(beneficiary.policyId) === Number(policyId) &&
                beneficiary.id !== excludedBeneficiaryId
            )
            .reduce(
                (total, beneficiary) =>
                    total + Number(
                        beneficiary.participationPercentage
                    ),
                0
            );

        const clearError = () => {
            error.value = null;
        };

        return {
            beneficiaries,
            loading,
            saving,
            error,
            fetchBeneficiaries,
            createBeneficiary,
            updateBeneficiary,
            getAssignedPercentage,
            clearError
        };
    }
);