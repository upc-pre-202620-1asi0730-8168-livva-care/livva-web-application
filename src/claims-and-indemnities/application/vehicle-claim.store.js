import { ref } from 'vue';
import { defineStore } from 'pinia';
import vehicleClaimsApi from '../infrastructure/vehicle-claims-api.js';
import claimStatusHistoriesApi from '../infrastructure/claim-status-histories-api.js';
import { VehicleClaimAssembler } from '../infrastructure/vehicle-claim.assembler.js';
import { ClaimStatusHistoryAssembler } from '../infrastructure/claim-status-history.assembler.js';

export const useVehicleClaimStore = defineStore(
    'vehicle-claims',
    () => {
        const vehicleClaims = ref([]);
        const statusHistories = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const fetchVehicleClaims = async (policyIds = []) => {
            loading.value = true;
            error.value = null;

            try {
                const response = await vehicleClaimsApi.getAll();
                const entities = VehicleClaimAssembler.toEntities(
                    response.data
                );

                const allowedPolicyIds = new Set(
                    policyIds.map((id) => Number(id))
                );

                vehicleClaims.value = allowedPolicyIds.size
                    ? entities.filter((vehicleClaim) =>
                        allowedPolicyIds.has(
                            Number(vehicleClaim.policyId)
                        )
                    )
                    : entities;
            } catch {
                error.value = 'vehicleClaims.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const fetchClaimStatusHistory = async (claimId) => {
            loading.value = true;
            error.value = null;

            try {
                const response =
                    await claimStatusHistoriesApi.getAll({
                        claimId
                    });

                statusHistories.value =
                    ClaimStatusHistoryAssembler
                        .toEntities(response.data)
                        .sort(
                            (first, second) =>
                                new Date(second.changedAt) -
                                new Date(first.changedAt)
                        );
            } catch {
                error.value = 'vehicleClaims.errors.historyLoad';
            } finally {
                loading.value = false;
            }
        };

        const createVehicleClaim = async (vehicleClaim) => {
            saving.value = true;
            error.value = null;

            try {
                const now = new Date().toISOString();

                const resource = VehicleClaimAssembler.toResource({
                    ...vehicleClaim,
                    status: 'reported',
                    reportedAt: now,
                    createdAt: now,
                    updatedAt: now
                });

                const response =
                    await vehicleClaimsApi.create(resource);

                const createdVehicleClaim =
                    VehicleClaimAssembler.toEntity(response.data);

                vehicleClaims.value.unshift(createdVehicleClaim);

                const historyResource =
                    ClaimStatusHistoryAssembler.toResource({
                        claimId: createdVehicleClaim.id,
                        status: createdVehicleClaim.status,
                        comment: '',
                        changedAt: now,
                        createdAt: now
                    });

                const historyResponse =
                    await claimStatusHistoriesApi.create(
                        historyResource
                    );

                statusHistories.value.unshift(
                    ClaimStatusHistoryAssembler.toEntity(
                        historyResponse.data
                    )
                );

                return createdVehicleClaim;
            } catch {
                error.value = 'vehicleClaims.errors.create';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const clearStatusHistories = () => {
            statusHistories.value = [];
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            vehicleClaims,
            statusHistories,
            loading,
            saving,
            error,
            fetchVehicleClaims,
            fetchClaimStatusHistory,
            createVehicleClaim,
            clearStatusHistories,
            clearError
        };
    }
);