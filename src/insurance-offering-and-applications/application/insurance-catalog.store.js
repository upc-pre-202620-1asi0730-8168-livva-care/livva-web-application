import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import insurersApi from '../infrastructure/insurers-api.js';
import insuranceProductsApi from '../infrastructure/insurance-products-api.js';
import { InsurerAssembler } from '../infrastructure/insurer.assembler.js';
import { InsuranceProductAssembler } from '../infrastructure/insurance-product.assembler.js';

export const MAX_COMPARED_PRODUCTS = 3;

export const useInsuranceCatalogStore = defineStore(
    'insurance-catalog',
    () => {
        const products = ref([]);
        const insurers = ref([]);
        const comparedProductIds = ref([]);
        const loading = ref(false);
        const error = ref(null);

        const fetchCatalog = async () => {
            loading.value = true;
            error.value = null;

            try {
                const [insurersResponse, productsResponse] = await Promise.all([
                    insurersApi.getAll(),
                    insuranceProductsApi.getAll()
                ]);

                insurers.value = InsurerAssembler.toEntities(
                    insurersResponse.data
                ).filter((insurer) => insurer.active);

                const activeInsurerIds = new Set(
                    insurers.value.map((insurer) => Number(insurer.id))
                );

                products.value = InsuranceProductAssembler.toEntities(
                    productsResponse.data
                ).filter(
                    (product) =>
                        product.active &&
                        activeInsurerIds.has(Number(product.insurerId))
                );
            } catch {
                error.value = 'catalog.errors.load';
            } finally {
                loading.value = false;
            }
        };

        const getInsurerName = (insurerId) =>
            insurers.value.find(
                (insurer) => Number(insurer.id) === Number(insurerId)
            )?.name ?? '—';

        const comparedProducts = computed(() =>
            comparedProductIds.value
                .map((productId) =>
                    products.value.find((product) => product.id === productId)
                )
                .filter(Boolean)
        );

        const isCompared = (productId) =>
            comparedProductIds.value.includes(productId);

        // Only products of the same insurance type can be compared, up to three at a time.
        const toggleComparison = (product) => {
            if (isCompared(product.id)) {
                comparedProductIds.value = comparedProductIds.value.filter(
                    (productId) => productId !== product.id
                );
                return 'removed';
            }

            const comparedType = comparedProducts.value[0]?.insuranceType;

            if (comparedType && comparedType !== product.insuranceType) {
                return 'differentType';
            }

            if (comparedProductIds.value.length >= MAX_COMPARED_PRODUCTS) {
                return 'limitReached';
            }

            comparedProductIds.value = [...comparedProductIds.value, product.id];
            return 'added';
        };

        const clearComparison = () => {
            comparedProductIds.value = [];
        };

        return {
            products,
            insurers,
            comparedProductIds,
            comparedProducts,
            loading,
            error,
            fetchCatalog,
            getInsurerName,
            isCompared,
            toggleComparison,
            clearComparison
        };
    }
);
