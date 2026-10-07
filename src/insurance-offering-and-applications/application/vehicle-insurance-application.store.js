import { ref } from 'vue';
import { defineStore } from 'pinia';

import vehiclesApi from '../infrastructure/vehicles-api.js';
import insurersApi from '../infrastructure/insurers-api.js';
import insuranceProductsApi from '../infrastructure/insurance-products-api.js';
import insuranceApplicationsApi from '../infrastructure/insurance-applications-api.js';
import vehicleInsuranceApplicationsApi from '../infrastructure/vehicle-insurance-applications-api.js';

import { VehicleAssembler } from '../infrastructure/vehicle.assembler.js';
import { InsurerAssembler } from '../infrastructure/insurer.assembler.js';
import { InsuranceProductAssembler } from '../infrastructure/insurance-product.assembler.js';
import { InsuranceApplicationAssembler } from '../infrastructure/insurance-application.assembler.js';
import { VehicleInsuranceApplicationAssembler } from '../infrastructure/vehicle-insurance-application.assembler.js';

const CURRENT_USER_ID = 1;

export const useVehicleInsuranceApplicationStore = defineStore(
    'vehicle-insurance-applications',
    () => {
        const vehicles = ref([]);
        const products = ref([]);
        const insurers = ref([]);
        const applications = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const buildApplicationViewModels = (
            applicationEntities,
            vehicleApplicationEntities
        ) => {
            const vehicleApplicationsById = new Map(
                vehicleApplicationEntities.map((detail) => [
                    detail.applicationId,
                    detail
                ])
            );

            applications.value = applicationEntities
                .map((application) => {
                    const detail = vehicleApplicationsById.get(application.id);

                    if (!detail) {
                        return null;
                    }

                    const vehicle = vehicles.value.find(
                        (item) => item.id === detail.vehicleId
                    );

                    const product = products.value.find(
                        (item) => item.id === application.productId
                    );

                    const insurer = product
                        ? insurers.value.find(
                            (item) => item.id === product.insurerId
                        )
                        : null;

                    if (!vehicle || !product || !insurer) {
                        return null;
                    }

                    return {
                        ...application,
                        vehicle,
                        product,
                        insurer
                    };
                })
                .filter(Boolean)
                .sort((first, second) => second.id - first.id);
        };

        const fetchApplications = async () => {
            loading.value = true;
            error.value = null;

            try {
                const [
                    vehiclesResponse,
                    insurersResponse,
                    productsResponse,
                    applicationsResponse,
                    vehicleApplicationsResponse
                ] = await Promise.all([
                    vehiclesApi.getAll({
                        userId: CURRENT_USER_ID
                    }),
                    insurersApi.getAll(),
                    insuranceProductsApi.getAll(),
                    insuranceApplicationsApi.getAll({
                        userId: CURRENT_USER_ID
                    }),
                    vehicleInsuranceApplicationsApi.getAll()
                ]);

                vehicles.value = VehicleAssembler.toEntities(
                    vehiclesResponse.data
                );

                insurers.value = InsurerAssembler.toEntities(
                    insurersResponse.data
                ).filter((insurer) => insurer.active);

                products.value = InsuranceProductAssembler.toEntities(
                    productsResponse.data
                ).filter(
                    (product) =>
                        product.active &&
                        product.insuranceType === 'vehicle'
                );

                const applicationEntities =
                    InsuranceApplicationAssembler.toEntities(
                        applicationsResponse.data
                    );

                const vehicleApplicationEntities =
                    VehicleInsuranceApplicationAssembler.toEntities(
                        vehicleApplicationsResponse.data
                    );

                buildApplicationViewModels(
                    applicationEntities,
                    vehicleApplicationEntities
                );
            } catch {
                error.value = 'vehicleApplications.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const createApplication = async ({
                                             vehicleId,
                                             productId,
                                             requestedCoverage
                                         }) => {
            const vehicle = vehicles.value.find(
                (item) => item.id === vehicleId
            );

            const product = products.value.find(
                (item) => item.id === productId
            );

            if (
                !vehicle ||
                !product ||
                requestedCoverage <= 0 ||
                requestedCoverage > product.coverageAmount
            ) {
                error.value = 'vehicleApplications.errors.invalidData';
                return null;
            }

            saving.value = true;
            error.value = null;

            let createdApplication = null;

            try {
                const timestamp = new Date().toISOString();

                const applicationResource =
                    InsuranceApplicationAssembler.toResource({
                        userId: CURRENT_USER_ID,
                        productId,
                        requestedCoverage,
                        status: 'pending',
                        createdAt: timestamp,
                        updatedAt: timestamp
                    });

                const applicationResponse =
                    await insuranceApplicationsApi.create(
                        applicationResource
                    );

                createdApplication =
                    InsuranceApplicationAssembler.toEntity(
                        applicationResponse.data
                    );

                const vehicleApplicationResource =
                    VehicleInsuranceApplicationAssembler.toResource({
                        applicationId: createdApplication.id,
                        vehicleId
                    });

                await vehicleInsuranceApplicationsApi.create(
                    vehicleApplicationResource
                );

                await fetchApplications();

                return createdApplication;
            } catch {
                if (createdApplication) {
                    try {
                        await insuranceApplicationsApi.delete(
                            createdApplication.id
                        );
                    } catch {
                        // The original creation error is preserved.
                    }
                }

                error.value = 'vehicleApplications.errors.create';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const cancelApplication = async (applicationId) => {
            const application = applications.value.find(
                (item) => item.id === applicationId
            );

            if (
                !application ||
                !['pending', 'under_review'].includes(application.status)
            ) {
                return false;
            }

            saving.value = true;
            error.value = null;

            try {
                await insuranceApplicationsApi.patch(applicationId, {
                    status: 'cancelled',
                    updatedAt: new Date().toISOString()
                });

                await fetchApplications();

                return true;
            } catch {
                error.value = 'vehicleApplications.errors.cancel';
                return false;
            } finally {
                saving.value = false;
            }
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            vehicles,
            products,
            insurers,
            applications,
            loading,
            saving,
            error,
            fetchApplications,
            createApplication,
            cancelApplication,
            clearError
        };
    }
);