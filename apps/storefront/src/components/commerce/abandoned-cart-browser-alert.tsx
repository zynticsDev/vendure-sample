'use client';

import {useEffect, useRef} from 'react';

const POLL_MS = 45_000;
const STORAGE_PREFIX = 'vendure-abandoned-cart-alert:';

/**
 * Polls the Shop API (via a same-origin route) for `activeOrder.isAbandonedCart` and shows a native browser `alert` once per order id per tab session.
 */
export function AbandonedCartBrowserAlert() {
    const lastOrderId = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setInterval> | undefined;

        const check = async () => {
            try {
                const res = await fetch('/api/abandoned-cart-status', {credentials: 'same-origin'});
                if (!res.ok || cancelled) {
                    return;
                }
                const body = (await res.json()) as {orderId: string | null; isAbandonedCart: boolean};
                const {orderId, isAbandonedCart} = body;

                if (orderId !== lastOrderId.current) {
                    lastOrderId.current = orderId;
                }

                if (!orderId || !isAbandonedCart) {
                    return;
                }

                const storageKey = `${STORAGE_PREFIX}${orderId}`;
                if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey)) {
                    return;
                }

                sessionStorage.setItem(storageKey, '1');
                window.alert(
                    'You still have items in your cart. Finish checkout soon before your session or stock changes.',
                );
            } catch {
                /* ignore network errors */
            }
        };

        void check();
        timer = setInterval(() => void check(), POLL_MS);

        return () => {
            cancelled = true;
            if (timer) {
                clearInterval(timer);
            }
        };
    }, []);

    return null;
}
