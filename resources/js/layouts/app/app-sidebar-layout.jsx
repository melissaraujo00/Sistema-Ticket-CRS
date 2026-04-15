import { AppSidebarHeader } from '@/components/app-sidebar-header';

export default function AppSidebarLayout({ children, breadcrumbs = [] }) {
    return (
        // 1. Le damos un fondo gris muy sutil a toda la pantalla (o fondo oscuro en dark mode)
        // Esto crea el contraste necesario para separar el menú del contenido.
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 font-sans">

            {/* ==========================================
                EL MENÚ (AFUERA)
                Ocupa el 100% del ancho, tiene fondo blanco y sombra
            ========================================== */}
            <div className="w-full relative z-50">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
            </div>

            {/* ==========================================
                EL CONTENIDO (ADENTRO)
                Está centrado, tiene un ancho máximo y no toca los bordes
            ========================================== */}
            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
                {/* Aquí adentro se inyectan tus dashboards (Dashboard, Mis Tickets, etc.) */}
                <div className="w-full h-full animate-in fade-in duration-500">
                    {children}
                </div>
            </main>

        </div>
    );
}
