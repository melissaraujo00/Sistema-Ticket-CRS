import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';

// 1. Importamos tu hook y los iconos de Lucide
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun, Bell, ChevronDown } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }) {
    const { auth } = usePage().props;

    const { appearance, updateAppearance } = useAppearance();
    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="border-sidebar-border/50 flex w-full h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-background">

            {/* --- LADO IZQUIERDO --- */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* --- LADO DERECHO: Estilo TailAdmin --- */}
            <div className="flex items-center gap-4">

                {/* Botón Modo Oscuro conectado a tu hook */}
                <button
                    onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                    {appearance === 'dark' ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </button>

                {/* Botón Notificaciones */}
                <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-background"></span>
                </button>

                {/* Divisor visual */}
                <div className="h-6 w-px bg-border hidden md:block"></div>

                {/* Perfil de Usuario Integrado */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 outline-none hover:bg-accent hover:text-accent-foreground p-1.5 rounded-md transition-colors cursor-pointer text-left">
                            <div className="hidden text-right md:block">
                                <span className="block text-sm font-medium text-foreground">
                                    {auth?.user?.name || 'Melissa'}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    Administrador
                                </span>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold overflow-hidden border border-indigo-200">
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
        </header>
    );
}
