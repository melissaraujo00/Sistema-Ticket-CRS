import { Link, usePage, router } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Constantes para rutas (evita strings mágicos)
const ROUTES = {
    MARK_AS_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    NOTIFICATIONS_INDEX: '/notifications',
};

// Componente hijo para cada notificación (mejora rendimiento y legibilidad)
const NotificationItem = ({ notification, onMarkAsRead }) => {
    const { id, data, created_at, read_at } = notification;
    const message = data?.message || 'Nuevo ticket';
    const subject = data?.subject || 'Sin asunto';
    const formattedDate = new Date(created_at).toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
    });

    const handleClick = () => onMarkAsRead(id);

    return (
        <div className="border-b last:border-0 hover:bg-muted/50 transition-colors">
            <button
                onClick={handleClick}
                className="w-full text-left px-4 py-3 block"
                aria-label={`Marcar notificación como leída: ${message}`}
            >
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        <p className="text-sm font-medium">{message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
                    </div>
                    {!read_at && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" aria-label="No leída" />}
                </div>
            </button>
        </div>
    );
};

export function NotificationsDropdown() {
    const { notifications } = usePage().props;
    // ✅ Sincroniza el estado local con las props (evita datos obsoletos)
    const [unread, setUnread] = useState(() =>
        (notifications || []).filter(n => !n.read_at)
    );

    // ✅ Actualiza el estado cuando cambian las props (ej: nuevas notificaciones desde el servidor)
    useEffect(() => {
        setUnread((notifications || []).filter(n => !n.read_at));
    }, [notifications]);

    const unreadCount = unread.length;

    // ✅ useCallback evita recrear la función en cada render
    const markAsRead = useCallback((notificationId) => {
        router.patch(ROUTES.MARK_AS_READ(notificationId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setUnread(prev => prev.filter(n => n.id !== notificationId));
            },
            onError: (error) => {
                console.error('Error al marcar como leída', error);
                // Podrías agregar un toast de error aquí
            },
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        router.post(ROUTES.MARK_ALL_READ, {}, {
            preserveScroll: true,
            onSuccess: () => setUnread([]),
            onError: (error) => {
                console.error('Error al marcar todas como leídas', error);
            },
        });
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Notificaciones"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-background" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 p-0">
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <span className="font-medium text-sm">Notificaciones</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-red-500 hover:underline"
                            aria-label="Marcar todas como leídas"
                        >
                            Marcar todas como leídas
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {unread.length === 0 ? (
                        <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                            No tienes notificaciones nuevas
                        </div>
                    ) : (
                        unread.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                            />
                        ))
                    )}
                </div>

                <div className="border-t px-4 py-2 text-center">
                    <Link
                        href={ROUTES.NOTIFICATIONS_INDEX}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        Ver todas las notificaciones
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
