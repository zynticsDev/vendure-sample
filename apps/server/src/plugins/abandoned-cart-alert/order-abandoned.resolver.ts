import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, Order, OrderLine, RequestContext, TransactionalConnection } from '@vendure/core';

const DEFAULT_IDLE_MINUTES = 20;

/** Order states where the customer has not finished checkout yet. */
const DEFAULT_OPEN_CART_STATES = new Set(['AddingItems', 'ArrangingPayment']);

function getConfiguredAbandonedCartIdleMinutes(): number {
    const raw = process.env.ABANDONED_CART_IDLE_MINUTES;
    const n = raw != null && raw !== '' ? Number(raw) : DEFAULT_IDLE_MINUTES;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_IDLE_MINUTES;
}

function idleMsFromEnv(): number {
    return getConfiguredAbandonedCartIdleMinutes() * 60 * 1000;
}

@Resolver('Order')
export class OrderAbandonedResolver {
    constructor(private connection: TransactionalConnection) {}

    @ResolveField()
    abandonedCartIdleMinutes(): number {
        return getConfiguredAbandonedCartIdleMinutes();
    }

    @ResolveField()
    async isAbandonedCart(@Ctx() ctx: RequestContext, @Parent() order: Order): Promise<boolean> {
        if (!DEFAULT_OPEN_CART_STATES.has(order.state)) {
            return false;
        }

        const lineCount = await this.connection.getRepository(ctx, OrderLine).count({
            where: { order: { id: order.id } },
        });
        if (lineCount === 0) {
            return false;
        }

        const idleMs = idleMsFromEnv();
        const updatedAt = order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt);
        return Date.now() - updatedAt.getTime() >= idleMs;
    }
}
