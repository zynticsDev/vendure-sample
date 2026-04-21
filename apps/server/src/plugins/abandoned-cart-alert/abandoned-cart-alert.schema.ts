import {parse} from 'graphql';

export const abandonedCartAlertSchema = parse(`
    extend type Order {
        """
        True when the order has lines, is still in an open-cart state, and has not been updated for longer than the configured idle window.
        """
        isAbandonedCart: Boolean!
        """
        Server idle threshold in minutes (from ABANDONED_CART_IDLE_MINUTES, default 20). Used for display and the abandonment check.
        """
        abandonedCartIdleMinutes: Int!
    }
`);
