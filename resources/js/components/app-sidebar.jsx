import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
import { BookOpen, Clock, Folder, LayoutGrid, ListChecks, Users, Ticket, HelpCircle, History } from 'lucide-react'; // Agregados Ticket y HelpCircle

import AppLogo from './app-logo';

const mainNavItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Mis Tickets',
        url: '/tickets',          // Ruta típica para tickets del usuario
        icon: Ticket,
        permission: 'ver tickets'          // Ícono de ticket
    },
    {
        title: 'FAQs',
        url: '/faqs',             // Ruta para preguntas frecuentes
        icon: HelpCircle,         // Ícono de ayuda
    },
    {
        title: 'Ticket',
        icon: ListChecks,
        children: [
            {
                title: 'Prioridades',
                url: '/priorities',
                icon: ListChecks,
                permission: 'ver prioridades'
            },
            {
                title: 'Planes SLA',
                url: '/sla-plans',
                icon: Clock,
                permission: 'ver sla plans'
            },
        ]
    },
    {
        title: 'Usuarios',
        url: '/users',
        icon: Users,
        permission: 'ver usuarios'
    },
];

function filterNavItems(items, hasPermission) {
    return items
        .filter(item => !item.permission || hasPermission(item.permission))
        .map(item =>
            item.children
                ? { ...item, children: filterNavItems(item.children, hasPermission) }
                : item
        )
        .filter(item => !item.children || item.children.length > 0);
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const userPermissions = auth?.user?.permissions || [];
    const hasPermission = (perm) => userPermissions.includes(perm);
    const filteredNavItems = filterNavItems(mainNavItems, hasPermission);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            {/* Opcional: si quieres agregar el footer con el usuario */}
            {/* <SidebarFooter>
                <NavUser />
            </SidebarFooter> */}
        </Sidebar>
    );
}
