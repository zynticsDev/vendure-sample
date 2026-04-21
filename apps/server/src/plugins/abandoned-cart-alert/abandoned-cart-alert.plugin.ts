import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { abandonedCartAlertSchema } from './abandoned-cart-alert.schema';
import { OrderAbandonedResolver } from './order-abandoned.resolver';

@VendurePlugin({
    compatibility: '^3.0.0',
    imports: [PluginCommonModule],
    shopApiExtensions: {
        schema: abandonedCartAlertSchema,
        resolvers: [OrderAbandonedResolver],
    },
    adminApiExtensions: {
        schema: abandonedCartAlertSchema,
        resolvers: [OrderAbandonedResolver],
    },
    dashboard: './dashboard/index.tsx',
})
export class AbandonedCartAlertPlugin {}
