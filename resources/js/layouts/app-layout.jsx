import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import useFlashToast from '@/hooks/useFlashToast';

export default function AppLayout({ children, breadcrumbs, ...props }) {
    useFlashToast();
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}
