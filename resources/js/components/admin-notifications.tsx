import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, ShoppingCart, CreditCard, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface NotificationCounts {
    new_orders: number;
    new_payments: number;
    new_users: number;
}

interface AdminNotificationsProps {
    counts?: NotificationCounts;
}

export function AdminNotifications({ counts }: AdminNotificationsProps) {
    const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
        new_orders: counts?.new_orders || 0,
        new_payments: counts?.new_payments || 0,
        new_users: counts?.new_users || 0,
    });

    const totalCount = notificationCounts.new_orders + notificationCounts.new_payments + notificationCounts.new_users;

    useEffect(() => {
        if (counts) {
            setNotificationCounts(counts);
        }
    }, [counts]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {totalCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {totalCount > 9 ? '9+' : totalCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {notificationCounts.new_orders > 0 && (
                    <>
                        <DropdownMenuItem
                            onClick={() => {
                                router.visit('/admin/orders');
                            }}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 shrink-0">
                                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium">Nouvelles commandes</div>
                                <div className="text-sm text-muted-foreground">
                                    {notificationCounts.new_orders} nouvelle{notificationCounts.new_orders > 1 ? 's' : ''}
                                </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0">{notificationCounts.new_orders}</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                {notificationCounts.new_payments > 0 && (
                    <>
                        <DropdownMenuItem
                            onClick={() => {
                                router.visit('/admin/orders');
                            }}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 shrink-0">
                                <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium">Nouveaux paiements</div>
                                <div className="text-sm text-muted-foreground">
                                    {notificationCounts.new_payments} nouveau{notificationCounts.new_payments > 1 ? 'x' : ''}
                                </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0">{notificationCounts.new_payments}</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                {notificationCounts.new_users > 0 && (
                    <>
                        <DropdownMenuItem
                            onClick={() => {
                                router.visit('/admin/dashboard');
                            }}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 shrink-0">
                                <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium">Nouveaux inscrits</div>
                                <div className="text-sm text-muted-foreground">
                                    {notificationCounts.new_users} nouveau{notificationCounts.new_users > 1 ? 'x' : ''}
                                </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0">{notificationCounts.new_users}</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                {totalCount === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Aucune nouvelle notification
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

