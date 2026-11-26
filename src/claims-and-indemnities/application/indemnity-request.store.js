import { ref } from 'vue';
import { defineStore } from 'pinia';
import indemnityRequestsApi from '../infrastructure/indemnity-requests-api.js';
import { IndemnityRequestAssembler } from '../infrastructure/indemnity-request.assembler.js';

export const useIndemnityRequestStore = defineStore(
    'indemnity-requests',
    () => {
        const indemnityRequests = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const sortByNewest = (requests) =>
            [...requests].sort(
                (first, second) =>
                    new Date(second.submittedAt) - new Date(first.submittedAt)
            );

        const fetchIndemnityRequests = async (policyIds = []) => {
            loading.value = true;
            error.value = null;

            try {
                const responses = await Promise.all(
                    policyIds.map((policyId) =>
                        indemnityRequestsApi.getByPolicyId(policyId)
                    )
                );

                indemnityRequests.value = sortByNewest(
                    responses.flatMap((response) =>
                        IndemnityRequestAssembler.toEntities(response.data)
                    )
                );
            } catch {
                error.value = 'indemnities.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const createIndemnityRequest = async (indemnityRequest) => {
            saving.value = true;
            error.value = null;

            try {
                const resource =
                    IndemnityRequestAssembler.toResource(indemnityRequest);

                const response = await indemnityRequestsApi.create(resource);
                const createdRequest =
                    IndemnityRequestAssembler.toEntity(response.data);

                indemnityRequests.value = sortByNewest([
                    createdRequest,
                    ...indemnityRequests.value
                ]);

                return createdRequest;
            } catch (requestError) {
                error.value = requestError.response?.status === 404
                    ? 'indemnities.errors.notFound'
                    : 'indemnities.errors.create';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            indemnityRequests,
            loading,
            saving,
            error,
            fetchIndemnityRequests,
            createIndemnityRequest,
            clearError
        };
    }
);
