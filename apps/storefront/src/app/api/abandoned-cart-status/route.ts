import {NextResponse} from 'next/server';
import {getAuthToken} from '@/lib/auth';
import {query} from '@/lib/vendure/api';
import {GetAbandonedCartAlertStatusQuery} from '@/lib/vendure/queries';

export async function GET() {
    const token = await getAuthToken();
    if (!token) {
        return NextResponse.json({orderId: null, isAbandonedCart: false});
    }

    try {
        const {data} = await query(GetAbandonedCartAlertStatusQuery, undefined, {token});
        const order = data.activeOrder;
        return NextResponse.json({
            orderId: order?.id ?? null,
            isAbandonedCart: Boolean(order?.isAbandonedCart),
        });
    } catch {
        return NextResponse.json({orderId: null, isAbandonedCart: false});
    }
}
