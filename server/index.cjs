require('dotenv').config({
    path: 'server/.env'
});

const crypto = require('crypto');
const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(
    path.join(__dirname, 'db.json')
);
const routes = require('./routes.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post(
    '/api/v1/payment-orders',
    async (request, response) => {
        const accessToken =
            process.env.MERCADO_PAGO_ACCESS_TOKEN;

        if (!accessToken) {
            return response.status(500).json({
                message:
                    'Mercado Pago no está configurado.'
            });
        }

        try {
            const mercadoPagoResponse = await fetch(
                'https://api.mercadopago.com/v1/orders',
                {
                    method: 'POST',
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,
                        'Content-Type':
                            'application/json',
                        'X-Idempotency-Key':
                            crypto.randomUUID()
                    },
                    body: JSON.stringify(request.body)
                }
            );

            const result = await mercadoPagoResponse
                .json()
                .catch(() => ({}));

            // DIAGNÓSTICO: muestra el motivo real en la terminal
            if (!mercadoPagoResponse.ok) {
                console.error(
                    '[MP] Error',
                    mercadoPagoResponse.status,
                    JSON.stringify(result, null, 2)
                );
            } else {
                console.log(
                    '[MP] Orden',
                    result.id,
                    result.status,
                    result.status_detail,
                    JSON.stringify(
                        result.transactions?.payments?.[0]
                            ?.status_detail
                    )
                );
            }

            return response
                .status(mercadoPagoResponse.status)
                .json(result);
        } catch (error) {
            console.error('[MP] Fallo de red:', error);

            return response.status(502).json({
                message:
                    'No se pudo contactar con Mercado Pago.'
            });
        }
    }
);

server.use(jsonServer.rewriter(routes));
server.use(router);

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(
        `Livva Fake API running on port ${port}`
    );
});
