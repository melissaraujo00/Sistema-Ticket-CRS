import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarLayout({ children, breadcrumbs = [] }) {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="flex min-h-screen w-full flex-col bg-slate-50 font-sans dark:bg-zinc-950">
                <div className="relative z-50 w-full">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                </div>
                <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:p-8">
                    <div className="animate-in fade-in h-full w-full duration-500">{children}</div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
