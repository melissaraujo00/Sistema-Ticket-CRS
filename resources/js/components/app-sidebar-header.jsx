import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import {
    Moon, Sun, Bell, ChevronDown,
    LayoutGrid, ListChecks, Users, Ticket, HelpCircle, Clock
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN DE RUTAS Y PERMISOS
// ==========================================
const mainNavItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Mis Tickets',
        url: '/tickets',
        icon: Ticket,
    },
    {
        title: 'FAQs',
        url: '/faqs',
        icon: HelpCircle,
    },
    {
        title: 'Ticket',
        icon: ListChecks,
        // Usamos "items" para los submenús
        items: [
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

// Función para filtrar según permisos de Spatie
function filterNavItems(items, hasPermission) {
    return items.reduce((filteredItems, item) => {
        if (item.permission && !hasPermission(item.permission)) {
            return filteredItems;
        }

        if (item.items) {
            const filteredChildren = item.items.filter(child =>
                !child.permission || hasPermission(child.permission)
            );

            if (filteredChildren.length > 0) {
                filteredItems.push({ ...item, items: filteredChildren });
            }
        } else {
            filteredItems.push(item);
        }

        return filteredItems;
    }, []);
}

// ==========================================
// 2. COMPONENTE PRINCIPAL DEL HEADER
// ==========================================
export function AppSidebarHeader({ breadcrumbs = [] }) {
    const { auth } = usePage().props;
    const { appearance, updateAppearance } = useAppearance();

    // Lógica de permisos
    const userPermissions = auth?.user?.permissions || [];
    const hasPermission = (perm) => userPermissions.includes(perm);
    const filteredNavItems = filterNavItems(mainNavItems, hasPermission);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const currentUrl = usePage().url;

    return (
        <header className="sticky top-0 z-50 flex flex-col w-full bg-background border-b border-border shadow-sm">

            {/* FILA 1: Logo, Modo Oscuro y Perfil */}
            <div className="flex h-16 items-center justify-between px-4 md:px-6">

                <Link href="/" className="flex items-center gap-2 text-red-600 font-black text-lg">
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-foreground tracking-tight">Gestión de Tickets</span>
                </Link>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        {appearance === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-background"></span>
                    </button>

                    <div className="h-6 w-px bg-border hidden md:block"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 outline-none hover:bg-accent hover:text-accent-foreground p-1.5 rounded-md transition-colors cursor-pointer text-left">
                                <div className="hidden text-right md:block">
                                    <span className="block text-sm font-medium text-foreground">
                                        {auth?.user?.name || 'Meli'}
                                    </span>
                                    <span className="block text-xs text-muted-foreground capitalize">
                                        {auth?.user?.roles?.[0] || 'Usuario'}
                                    </span>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold overflow-hidden border border-red-200">
                                    {(auth?.user?.name?.charAt(0)) || 'M'}
                                </div>
                                <ChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 mt-1">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* FILA 2: Rutas Dinámicas Horizontales */}
            <div className="flex items-center px-4 md:px-6 h-12 bg-muted/10 border-t border-border overflow-x-auto hide-scrollbar">
                <nav className="flex items-center gap-6 text-sm font-medium h-full">

                    {/* Mapeamos las rutas dinámicamente */}
                    {filteredNavItems.map((item, index) => {
                        const Icon = item.icon;

                        // Si el ítem tiene submenús (ej. Ticket > Prioridades)
                        if (item.items && item.items.length > 0) {
                            return (
                                <DropdownMenu key={`menu-${index}`}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 h-full border-b-2 border-transparent transition-colors px-1 text-muted-foreground hover:text-foreground hover:border-gray-300 outline-none cursor-pointer whitespace-nowrap">
                                            {Icon && <Icon className="w-4 h-4" />}
                                            {item.title}
                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48 mt-1">
                                        {item.items.map((subItem, subIndex) => {
                                            const SubIcon = subItem.icon;
                                            return (
                                                <DropdownMenuItem key={`sub-${subIndex}`} asChild>
                                                    <Link href={subItem.url} className="flex w-full items-center cursor-pointer">
                                                        {SubIcon && <SubIcon className="mr-2 h-4 w-4 text-muted-foreground" />}
                                                        {subItem.title}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        // Si el ítem es un enlace directo (ej. Dashboard)
                        const isActive = currentUrl.startsWith(item.url);
                        return (
                            <Link
                                key={`link-${index}`}
                                href={item.url}
                                className={`flex items-center gap-2 h-full border-b-2 transition-colors px-1 whitespace-nowrap ${
                                    isActive
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                }`}
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {item.title}
                            </Link>
                        );
                    })}

                </nav>
            </div>

        </header>
    );
}
