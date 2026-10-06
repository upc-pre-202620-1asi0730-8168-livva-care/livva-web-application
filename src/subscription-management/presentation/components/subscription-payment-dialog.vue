<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch
} from 'vue';
import { useI18n } from 'vue-i18n';
import { loadMercadoPago } from '@mercadopago/sdk-js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  },
  billingCycle: {
    type: String,
    default: 'monthly'
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:visible',
  'payment-approved'
]);

const { t, locale } = useI18n();

const loadingBrick = ref(false);
const processing = ref(false);
const paymentError = ref(null);

let brickController = null;

const amount = computed(() => {
  if (!props.plan) return 0;

  return props.billingCycle === 'annual'
      ? Number(props.plan.annualPrice)
      : Number(props.plan.monthlyPrice);
});

const planTitle = computed(() => {
  if (!props.plan) return '';

  return t(
      `subscriptions.plans.${props.plan.name}.title`
  );
});

const billingCycleLabel = computed(() =>
    props.billingCycle === 'annual'
        ? t('subscriptions.plans.annual')
        : t('subscriptions.plans.monthly')
);

const formattedAmount = computed(() =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN'
        }
    ).format(amount.value)
);

const destroyBrick = async () => {
  if (!brickController) return;

  try {
    await brickController.unmount();
  } catch {
    // The Brick may already be unmounted.
  }

  brickController = null;
};

const closeDialog = () => {
  if (processing.value || props.saving) return;

  emit('update:visible', false);
};

const processPayment = async (
    formData,
    additionalData
) => {
  processing.value = true;
  paymentError.value = null;

  try {
    const total = amount.value.toFixed(2);

    const order = {
      type: 'online',
      total_amount: total,
      external_reference:
          `livva-plan-${props.plan.id}-${Date.now()}`,
      processing_mode: 'automatic',
      transactions: {
        payments: [
          {
            amount: total,
            payment_method: {
              id: formData.payment_method_id,
              type: additionalData.paymentTypeId,
              token: formData.token,
              installments:
              formData.installments
            }
          }
        ]
      },
      payer: {
        email: formData.payer.email,
        identification:
        formData.payer.identification
      }
    };

    const response = await fetch(
        import.meta.env.VITE_PAYMENT_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
          result.message ??
          result.message_error ??
          'Payment rejected'
      );
    }

    const mercadoPagoPayment =
        result.transactions?.payments?.[0];

    const approved =
        mercadoPagoPayment?.status === 'processed' &&
        mercadoPagoPayment?.status_detail ===
        'accredited';

    if (!approved) {
      throw new Error(
          mercadoPagoPayment?.status_detail ??
          'Payment not approved'
      );
    }

    emit('payment-approved', {
      provider: 'mercado-pago-sandbox',
      providerPaymentId:
          mercadoPagoPayment.id ?? result.id,
      status: 'approved',
      paidAt:
          result.last_updated_date ??
          new Date().toISOString()
    });
  } catch (error) {
    console.error(error);

    paymentError.value =
        'subscriptions.errors.payment';

    throw error;
  } finally {
    processing.value = false;
  }
};

const renderBrick = async () => {
  if (
      !props.plan ||
      amount.value <= 0 ||
      brickController
  ) {
    return;
  }

  loadingBrick.value = true;
  paymentError.value = null;

  try {
    const publicKey =
        import.meta.env
            .VITE_MERCADO_PAGO_PUBLIC_KEY;

    if (!publicKey) {
      throw new Error(
          'Missing Mercado Pago Public Key'
      );
    }

    await loadMercadoPago();

    const mercadoPago =
        new window.MercadoPago(
            publicKey,
            {
              locale:
                  locale.value === 'es'
                      ? 'es-PE'
                      : 'en-US'
            }
        );

    const bricksBuilder =
        mercadoPago.bricks();

    brickController =
        await bricksBuilder.create(
            'cardPayment',
            'subscription-payment-brick',
            {
              initialization: {
                amount: amount.value
              },
              customization: {
                visual: {
                  style: {
                    theme: 'default'
                  }
                },
                paymentMethods: {
                  maxInstallments: 1
                }
              },
              callbacks: {
                onReady: () => {
                  loadingBrick.value = false;
                },
                onSubmit: (
                    formData,
                    additionalData
                ) =>
                    processPayment(
                        formData,
                        additionalData
                    ),
                onError: (error) => {
                  console.error(error);

                  paymentError.value =
                      'subscriptions.errors.payment';

                  loadingBrick.value = false;
                }
              }
            }
        );
  } catch (error) {
    console.error(error);

    paymentError.value =
        'subscriptions.errors.payment';

    loadingBrick.value = false;
  }
};

watch(
    () => props.visible,
    async (visible) => {
      if (visible) {
        await nextTick();
        await renderBrick();
      } else {
        paymentError.value = null;
        await destroyBrick();
      }
    }
);

onBeforeUnmount(destroyBrick);
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :closable="!processing && !saving"
      :dismissable-mask="false"
      :header="t('subscriptions.payment.title')"
      :style="{ width: 'min(94vw, 620px)' }"
      @update:visible="closeDialog"
  >
    <div
        v-if="plan"
        class="payment-dialog"
    >
      <p class="payment-dialog__description">
        {{ t('subscriptions.payment.description') }}
      </p>

      <div class="payment-dialog__summary">
        <div>
          <span>
            {{
              t(
                  'subscriptions.payment.selectedPlan'
              )
            }}
          </span>
          <strong>{{ planTitle }}</strong>
        </div>

        <div>
          <span>
            {{
              t(
                  'subscriptions.payment.billingCycle'
              )
            }}
          </span>
          <strong>{{ billingCycleLabel }}</strong>
        </div>

        <div>
          <span>
            {{ t('subscriptions.payment.total') }}
          </span>
          <strong>{{ formattedAmount }}</strong>
        </div>
      </div>

      <pv-message
          severity="info"
          :closable="false"
      >
        {{
          t(
              'subscriptions.payment.sandboxNotice'
          )
        }}
      </pv-message>

      <pv-message
          v-if="paymentError"
          severity="error"
          :closable="false"
      >
        {{ t(paymentError) }}
      </pv-message>

      <div
          v-if="loadingBrick"
          class="payment-dialog__loading"
      >
        <pv-progress-spinner
            stroke-width="4"
        />
      </div>

      <div
          id="subscription-payment-brick"
          :class="{
            'payment-dialog__brick--disabled':
                processing || saving
          }"
      ></div>
    </div>
  </pv-dialog>
</template>

<style scoped>
.payment-dialog {
  display: grid;
  gap: 1rem;
}

.payment-dialog__description {
  margin: 0;
  color: #52627a;
}

.payment-dialog__summary {
  display: grid;
  padding: 1rem;
  gap: 0.75rem;
  background: #f5f8fc;
  border: 1px solid #dfe6f0;
  border-radius: 14px;
}

.payment-dialog__summary div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.payment-dialog__summary span {
  color: #52627a;
}

.payment-dialog__summary strong {
  color: #081b3a;
  text-align: right;
}

.payment-dialog__loading {
  display: grid;
  min-height: 180px;
  place-items: center;
}

.payment-dialog__brick--disabled {
  opacity: 0.65;
  pointer-events: none;
}
</style>