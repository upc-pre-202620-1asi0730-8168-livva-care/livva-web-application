import { ref } from 'vue';
import { defineStore } from 'pinia';

import insurersApi from '../infrastructure/insurers-api.js';
import insuranceProductsApi from '../infrastructure/insurance-products-api.js';
import insuranceApplicationsApi from '../infrastructure/insurance-applications-api.js';
import lifeInsuranceApplicationsApi from '../infrastructure/life-insurance-applications-api.js';

import { InsurerAssembler } from '../infrastructure/insurer.assembler.js';
import { InsuranceProductAssembler } from '../infrastructure/insurance-product.assembler.js';
import { InsuranceApplicationAssembler } from '../infrastructure/insurance-application.assembler.js';
import { LifeInsuranceApplicationAssembler } from '../infrastructure/life-insurance-application.assembler.js';

const CURRENT_USER_ID = 1;

export const useLifeInsuranceApplicationStore = defineStore(
    'life-insurance-applications',
    () => {
        const products = ref([]);
        const insurers = ref([]);
        const applications = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const buildApplicationViewModels = (
            applicationEntities,
            lifeApplicationEntities
        ) => {
            const lifeApplicationIds = new Set(
                lifeApplicationEntities.map(
                    (detail) => detail.applicationId
                )
            );

            applications.value = applicationEntities
                .filter((application) =>
                    lifeApplicationIds.has(application.id)
                )
                .map((application) => {
                    const product = products.value.find(
                        (item) => item.id === application.productId
                    );

                    const insurer = product
                        ? insurers.value.find(
                            (item) => item.id === product.insurerId
                        )
                        : null;

                    if (!product || !insurer) {
                        return null;
                    }

                    return {
                        ...application,
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
                    insurersResponse,
                    productsResponse,
                    applicationsResponse,
                    lifeApplicationsResponse
                ] = await Promise.all([
                    insurersApi.getAll(),
                    insuranceProductsApi.getAll(),
                    insuranceApplicationsApi.getAll({
                        userId: CURRENT_USER_ID
                    }),
                    lifeInsuranceApplicationsApi.getAll()
                ]);

                insurers.value = InsurerAssembler.toEntities(
                    insurersResponse.data
                ).filter((insurer) => insurer.active);

                products.value = InsuranceProductAssembler.toEntities(
                    productsResponse.data
                ).filter(
                    (product) =>
                        product.active &&
                        product.insuranceType === 'life'
                );

                const applicationEntities =
                    InsuranceApplicationAssembler.toEntities(
                        applicationsResponse.data
                    );

                const lifeApplicationEntities =
                    LifeInsuranceApplicationAssembler.toEntities(
                        lifeApplicationsResponse.data
                    );

                buildApplicationViewModels(
                    applicationEntities,
                    lifeApplicationEntities
                );
            } catch {
                error.value = 'lifeApplications.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const createApplication = async ({
                                             productId,
                                             requestedCoverage
                                         }) => {
            const product = products.value.find(
                (item) => item.id === productId
            );

            if (
                !product ||
                requestedCoverage <= 0 ||
                requestedCoverage > product.coverageAmount
            ) {
                error.value = 'lifeApplications.errors.invalidData';
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

                const lifeApplicationResource =
                    LifeInsuranceApplicationAssembler.toResource({
                        applicationId: createdApplication.id
                    });

                await lifeInsuranceApplicationsApi.create(
                    lifeApplicationResource
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

                error.value = 'lifeApplications.errors.create';
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
                error.value = 'lifeApplications.errors.cancel';
                return false;
            } finally {
                saving.value = false;
            }
        };


        const clearError = () => {
            error.value = null;
        };

        return {
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