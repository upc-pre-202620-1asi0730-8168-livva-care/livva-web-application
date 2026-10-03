import { ref } from 'vue';
import { defineStore } from 'pinia';
import policiesApi from '../infrastructure/policies-api.js';
import { PolicyAssembler } from '../infrastructure/policy.assembler.js';

export const usePolicyStore = defineStore('policy-management', () => {
    const policies = ref([]);
    const selectedPolicy = ref(null);
    const coverages = ref([]);
    const documents = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchPolicies = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await policiesApi.getAll();
            policies.value = PolicyAssembler.toEntities(response.data);
        } catch {
            error.value = 'Unable to load policies.';
        } finally {
            loading.value = false;
        }
    };

    const fetchPolicyById = async (policyId) => {
        loading.value = true;
        error.value = null;

        try {
            const [policyResponse, coveragesResponse, documentsResponse] =
                await Promise.all([
                    policiesApi.getById(policyId),
                    policiesApi.getCoverages(policyId),
                    policiesApi.getDocuments(policyId)
                ]);

            selectedPolicy.value = PolicyAssembler.toEntity(
                policyResponse.data
            );

            coverages.value = coveragesResponse.data;
            documents.value = documentsResponse.data;
        } catch {
            error.value = 'Unable to load policy details.';
        } finally {
            loading.value = false;
        }
    };

    const clearSelectedPolicy = () => {
        selectedPolicy.value = null;
        coverages.value = [];
        documents.value = [];
        error.value = null;
    };

    return {
        policies,
        selectedPolicy,
        coverages,
        documents,
        loading,
        error,
        fetchPolicies,
        fetchPolicyById,
        clearSelectedPolicy
    };
});