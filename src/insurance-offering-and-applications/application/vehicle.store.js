import { ref } from 'vue';
import { defineStore } from 'pinia';
import vehiclesApi from '../infrastructure/vehicles-api.js';
import { VehicleAssembler } from '../infrastructure/vehicle.assembler.js';

export const useVehicleStore = defineStore('vehicle-management', () => {
    const vehicles = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const deletingId = ref(null);
    const error = ref(null);

    const fetchVehicles = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await vehiclesApi.getAll();
            vehicles.value = VehicleAssembler.toEntities(response.data);
        } catch {
            error.value = 'vehicles.errors.load';
        } finally {
            loading.value = false;
        }
    };

    const createVehicle = async (vehicle) => {
        saving.value = true;
        error.value = null;

        try {
            const resource = VehicleAssembler.toResource(vehicle);
            const response = await vehiclesApi.create(resource);
            const createdVehicle = VehicleAssembler.toEntity(response.data);

            vehicles.value.push(createdVehicle);
            return createdVehicle;
        } catch {
            error.value = 'vehicles.errors.create';
            return null;
        } finally {
            saving.value = false;
        }
    };

    const updateVehicle = async (vehicleId, vehicle) => {
        saving.value = true;
        error.value = null;

        try {
            const resource = VehicleAssembler.toResource(vehicle);
            const response = await vehiclesApi.patch(vehicleId, resource);
            const updatedVehicle = VehicleAssembler.toEntity(response.data);

            const index = vehicles.value.findIndex(
                (currentVehicle) => currentVehicle.id === vehicleId
            );

            if (index !== -1) {
                vehicles.value[index] = updatedVehicle;
            }

            return updatedVehicle;
        } catch {
            error.value = 'vehicles.errors.update';
            return null;
        } finally {
            saving.value = false;
        }
    };

    const deleteVehicle = async (vehicleId) => {
        if (deletingId.value !== null) {
            return false;
        }

        deletingId.value = vehicleId;
        error.value = null;

        try {
            await vehiclesApi.delete(vehicleId);
            await fetchVehicles();

            return true;
        } catch {
            error.value = 'vehicles.errors.delete';
            return false;
        } finally {
            deletingId.value = null;
        }
    };
    const clearError = () => {
        error.value = null;
    };

    return {
        vehicles,
        loading,
        saving,
        deletingId,
        error,
        fetchVehicles,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        clearError
    };
});