import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Building, Clock, Component, HelpCircle, Layers, LayoutGrid, ListChecks, Network, Star, Ticket, Users } from 'lucide-react';

import AppLogo from './app-logo';

const mainNavItems = [
    {
        title: 'Dashboards',
        icon: LayoutGrid,
        children: [
            {
                title: 'General',
                url: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Rating Técnicos',
                url: '/ratings-dashboard',
                icon: Star,
                role: 'superadmin',
            },
        ],
    },
    {
        title: 'Mis Tickets',
        url: '/tickets', // Ruta típica para tickets del usuario
        icon: Ticket,
        permission: 'ver tickets', // Ícono de ticket
    },
    {
        title: 'FAQs',
        url: '/faqs', // Ruta para preguntas frecuentes
        icon: HelpCircle, // Ícono de ayuda
    },
    {
        title: 'Ticket',
        icon: ListChecks,
        children: [
            {
                title: 'Prioridades',
                url: '/priorities',
                icon: ListChecks,
                permission: 'ver prioridades',
            },
            {
                title: 'Planes SLA',
                url: '/sla-plans',
                icon: Clock,
                permission: 'ver sla plans',
            },
        ],
    },
    {
        title: 'Usuarios',
        url: '/users',
        icon: Users,
        permission: 'manage_users',
    },

    // ==========================================
    // ESTRUCTURA ORGANIZACIONAL
    // ==========================================
    {
        title: 'Estructura',
        icon: Network,
        children: [
            {
                title: 'Áreas',
                url: '/areas',
                icon: Layers,
                permission: 'manage_areas',
            },
            {
                title: 'Departamentos',
                url: '/departments',
                icon: Building,
                permission: 'manage_departments',
            },
            {
                title: 'Divisiones',
                url: '/divisions',
                icon: Component,
                permission: 'manage_divisions',
            },
        ],
    },
];

function filterNavItems(items, hasPermission, userRoles) {
    return items
        .filter((item) => {
            const permissionMatch = !item.permission || hasPermission(item.permission);
            const roleMatch = !item.role || userRoles.includes(item.role);
            return permissionMatch && roleMatch;
        })
        .map((item) => (item.children ? { ...item, children: filterNavItems(item.children, hasPermission, userRoles) } : item))
        .filter((item) => !item.children || item.children.length > 0);
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const userPermissions = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || [];
    const hasPermission = (perm) => userPermissions.includes(perm);
    const filteredNavItems = filterNavItems(mainNavItems, hasPermission, userRoles);

    return (
        /* Agregamos el contenedor div con "md:hidden" para que Shadcn no renderice el sidebar en escritorio */
        <div className="md:hidden">
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
        </div>
    );
}
