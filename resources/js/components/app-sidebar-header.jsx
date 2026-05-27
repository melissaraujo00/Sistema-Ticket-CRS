import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import {
    Moon,
    Sun,
    Bell,
    LayoutGrid,
    Folder,
    ClipboardList,
    BookOpen,
    Settings,
    FileText,
    AlertTriangle,
    Users,
    History,
    ChevronDown,
    Ticket,
    PlusCircle,
    List,
    HelpCircle,
    Network,
    Layers,
    Building,
    Star,
    Component,
} from 'lucide-react';

// ==========================================
// 1. DICCIONARIO DE ICONOS (Server-Driven)
// ==========================================
// Mapea los strings que envía el backend ("LayoutGrid") a los componentes de Lucide
const ICONS = {
    LayoutGrid,
    Folder,
    ClipboardList,
    BookOpen,
    Settings,
    FileText,
    AlertTriangle,
    Users,
    History,
    Ticket,
    PlusCircle,
    List,
    HelpCircle,
    Network,
    Layers,
    Building,
    Star,
    Component,
};

// ==========================================
// 2. COMPONENTE PRINCIPAL DEL HEADER
// ==========================================
export function AppSidebarHeader({ breadcrumbs = [] }) {
    // Extraemos la prop 'navigation' que inyectamos desde HandleInertiaRequests
    const { auth, navigation = [] } = usePage().props;
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const currentUrl = usePage().url;

    return (
        <header className="bg-background border-border sticky top-0 z-50 flex w-full flex-col border-b shadow-sm">
            {/* FILA 1: Logo, Modo Oscuro y Perfil */}
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* NUEVO CONTENEDOR: Agrupa el botón de menú móvil y el logo */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />

                    <Link href="/" className="flex items-center gap-2 text-lg font-black text-red-600">
                        <span className="text-2xl leading-none">+</span>
                        <span className="text-foreground tracking-tight">Gestión de Tickets</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="bg-secondary text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    >
                        {appearance === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    <NotificationsDropdown />

                    <div className="bg-border hidden h-6 w-px md:block"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-md p-1.5 text-left transition-colors outline-none">
                                <div className="hidden text-right md:block">
                                    <span className="text-foreground block text-sm font-medium">{auth?.user?.name || 'Administrador'}</span>
                                    <span className="text-muted-foreground block text-xs capitalize">{auth?.user?.roles?.[0] || 'Usuario'}</span>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-red-200 bg-red-100 font-bold text-red-600">
                                    {auth?.user?.name?.charAt(0) || 'M'}
                                </div>
                                <ChevronDown className="text-muted-foreground hidden h-4 w-4 sm:block" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="mt-1 w-56">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* FILA 2: Rutas Dinámicas Horizontales (Server-Driven) */}
            <div className="bg-muted/10 border-border hide-scrollbar hidden h-12 items-center overflow-x-auto border-t px-4 md:flex md:px-6">
                <nav className="flex h-full items-center gap-6 text-sm font-medium">
                    {/* Mapeamos las rutas dinámicamente desde Laravel */}
                    {navigation.map((item, index) => {
                        const Icon = item.icon ? ICONS[item.icon] : null;

                        // Si el ítem tiene submenús (ej. Configuración -> Planes SLA)
                        if (item.items && item.items.length > 0) {
                            return (
                                <DropdownMenu key={`menu-${index}`}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="text-muted-foreground hover:text-foreground flex h-full cursor-pointer items-center gap-2 border-b-2 border-transparent px-1 whitespace-nowrap transition-colors outline-none hover:border-gray-300">
                                            {Icon && <Icon className="h-4 w-4" />}
                                            {item.title}
                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="mt-1 w-48">
                                        {item.items.map((subItem, subIndex) => {
                                            const SubIcon = subItem.icon ? ICONS[subItem.icon] : null;
                                            return (
                                                <DropdownMenuItem key={`sub-${subIndex}`} asChild>
                                                    <Link href={subItem.url} className="flex w-full cursor-pointer items-center">
                                                        {SubIcon && <SubIcon className="text-muted-foreground mr-2 h-4 w-4" />}
                                                        {subItem.title}
                                                    </Link>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        // Busca este bloque en tu archivo AppSidebarHeader.tsx y reemplázalo:

                        let isActive = false;
                        try {
                            const itemPath = new URL(item.url, item.url.startsWith('http') ? undefined : 'http://x').pathname;

                            isActive = currentUrl === itemPath || currentUrl === item.url;
                        } catch (e) {
                            isActive = currentUrl === item.url;
                        }
                        return (
                            <Link
                                key={`link-${index}`}
                                href={item.url}
                                className={`flex h-full items-center gap-2 border-b-2 px-1 whitespace-nowrap transition-colors ${
                                    isActive
                                        ? 'border-red-600 text-red-600'
                                        : 'text-muted-foreground hover:text-foreground border-transparent hover:border-gray-300'
                                }`}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
