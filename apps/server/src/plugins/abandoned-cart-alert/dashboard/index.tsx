import {
    api,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    defineDashboardExtension,
    Page,
    PageBlock,
    PageLayout,
    PageTitle,
} from '@vendure/dashboard';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { graphql, type ResultOf } from '@/gql';

const orderAbandonedCartAdminDocument = graphql(`
    query OrderAbandonedCartAdmin($id: ID!) {
        order(id: $id) {
            id
            isAbandonedCart
            abandonedCartIdleMinutes
        }
    }
`);

type OrderAbandonedCartAdminData = ResultOf<typeof orderAbandonedCartAdminDocument>;

function AbandonedCartAdminBlock({ context }: { context: { entity?: { id?: string } } }) {
    const orderId = context.entity?.id;

    const { data, isPending, isError } = useQuery({
        queryKey: ['order-abandoned-cart-admin', orderId],
        queryFn: (): Promise<OrderAbandonedCartAdminData> =>
            api.query(orderAbandonedCartAdminDocument, { id: orderId! }),
        enabled: Boolean(orderId),
    });

    if (!orderId) {
        return null;
    }

    if (isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Abandoned cart</CardTitle>
                    <CardDescription>Loading…</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isError || !data?.order) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Abandoned cart</CardTitle>
                    <CardDescription>Could not load status.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const { isAbandonedCart, abandonedCartIdleMinutes } = data.order;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Abandoned cart</CardTitle>
                <CardDescription>Uses ABANDONED_CART_IDLE_MINUTES on the server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Idle threshold</span>
                    <span className="font-medium tabular-nums">{abandonedCartIdleMinutes} min</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Currently abandoned</span>
                    <Badge variant={isAbandonedCart ? 'destructive' : 'secondary'}>
                        {isAbandonedCart ? 'Yes' : 'No'}
                    </Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-snug">
                    States AddingItems or ArrangingPayment, at least one line, and order updatedAt older than the
                    threshold.
                </p>
            </CardContent>
        </Card>
    );
}

function AbandonedCartOverviewPage() {
    return (
        <Page pageId="abandoned-cart-overview">
            <PageTitle>Abandoned cart</PageTitle>
            <PageLayout>
                <PageBlock column="main" blockId="abandoned-cart-overview-main">
                    <div className="max-w-2xl space-y-4 text-sm leading-relaxed">
                        <p>
                            This plugin does not change the <strong>Catalog → Products</strong> screen. It adds:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                A card on each <strong>order detail</strong> page (open{' '}
                                <strong>Sales → Orders</strong>, then click an order). Look in the right column,
                                under <strong>State</strong>, for the <strong>Abandoned cart</strong> card.
                            </li>
                            <li>
                                Shop API fields <code className="rounded bg-muted px-1 py-0.5 text-xs">isAbandonedCart</code>{' '}
                                and{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">abandonedCartIdleMinutes</code>{' '}
                                for your storefront.
                            </li>
                        </ul>
                        <p className="text-muted-foreground">
                            Configure idle time on the Vendure server with{' '}
                            <code className="rounded bg-muted px-1 py-0.5 text-xs">ABANDONED_CART_IDLE_MINUTES</code>{' '}
                            (minutes, default 15).
                        </p>
                        <Button variant="secondary" render={<Link to="/orders" />}>
                            Open orders list
                        </Button>
                    </div>
                </PageBlock>
            </PageLayout>
        </Page>
    );
}

defineDashboardExtension({
    navSections: [
        {
            id: 'abandoned-cart-tools',
            title: 'Abandoned cart',
            icon: ShoppingCart,
            order: 55,
        },
    ],
    routes: [
        {
            path: '/abandoned-cart',
            loader: () => ({ breadcrumb: 'Abandoned cart' }),
            navMenuItem: {
                sectionId: 'abandoned-cart-tools',
                id: 'abandoned-cart-overview',
                title: 'Overview',
            },
            component: () => <AbandonedCartOverviewPage />,
        },
    ],
    pageBlocks: [
        {
            id: 'abandoned-cart-alert-order-detail',
            title: 'Abandoned cart',
            location: {
                pageId: 'order-detail',
                column: 'side',
                position: { blockId: 'state', order: 'after' },
            },
            component: AbandonedCartAdminBlock,
            requiresPermission: ['ReadOrder'],
        },
    ],
});

export default function AbandonedCartDashboardExtension() {
    return null;
}
