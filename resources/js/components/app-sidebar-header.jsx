import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import {
    Moon,
    Sun,
    Bell,
    ChevronDown,
    LayoutGrid,
    Folder,
    ClipboardList,
    BookOpen,
    Settings,
    FileText,
    AlertTriangle,
    Users,
    Ticket,
    PlusCircle,
    List,
    HelpCircle,
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
    Ticket,
    PlusCircle,
    List,
    HelpCircle,
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

                    <NotificationsDropdown />

                    <div className="h-6 w-px bg-border hidden md:block"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 outline-none hover:bg-accent hover:text-accent-foreground p-1.5 rounded-md transition-colors cursor-pointer text-left">
                                <div className="hidden text-right md:block">
                                    <span className="block text-sm font-medium text-foreground">
                                        {auth?.user?.name || 'Administrador'}
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

            {/* FILA 2: Rutas Dinámicas Horizontales (Server-Driven) */}
            <div className="flex items-center px-4 md:px-6 h-12 bg-muted/10 border-t border-border overflow-x-auto hide-scrollbar">
                <nav className="flex items-center gap-6 text-sm font-medium h-full">

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

                        let isActive = false;
                        try {
                            const itemPath = new URL(item.url, item.url.startsWith('http') ? undefined : 'http://x').pathname;
                            isActive = currentUrl.startsWith(itemPath);
                        } catch (e) {
                            isActive = currentUrl.startsWith(item.url);
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
