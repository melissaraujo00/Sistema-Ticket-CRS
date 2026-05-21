import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import UserRoleBadge from '@/components/users/UserRoleBadge';
import { useUserActions } from '@/hooks/use-user-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Trashed({ users }) {
    const { restore } = useUserActions();
    const [confirmId, setConfirmId] = useState(null);
    const [isRestoring, setIsRestoring] = useState(null);

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const columns = [
        {
            header: 'Usuario',
            className: 'w-1/3',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block font-semibold text-zinc-900 dark:text-zinc-50">{user.name}</span>
                        {user.institution_code && <span className="text-xs text-zinc-500">Cód: {user.institution_code}</span>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Contacto',
            className: 'hidden md:table-cell',
            render: (user) => (
                <div className="flex flex-col">
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{user.email}</span>
                    {user.phone_number && (
                        <span className="text-xs font-medium text-zinc-400">
                            Tel: {user.phone_number} {user.ext && `(Ext: ${user.ext})`}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Departamento',
            className: 'hidden md:table-cell text-zinc-600 dark:text-zinc-400',
            render: (user) => <span className="text-sm">{user.department?.name ?? 'Sin asignar'}</span>,
        },
        {
            header: 'Rol',
            render: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles?.length > 0 ? (
                        user.roles.map((role) => <UserRoleBadge key={role.id} role={role} />)
                    ) : (
                        <span className="text-xs text-zinc-400 italic">Sin Rol</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Estado',
            render: () => (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Inactivo
                </span>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right w-32',
            render: (user) => (
                <div className="flex justify-end gap-2">
                    {confirmId === user.id ? (
                        <div className="animate-in fade-in slide-in-from-right-2 flex items-center gap-1.5">
                            <span className="text-xs font-medium text-zinc-500">¿Restaurar?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRestoring(user.id);
                                    restore(user.id, () => {
                                        setConfirmId(null);
                                        setIsRestoring(null);
                                    });
                                }}
                                disabled={isRestoring === user.id}
                                className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {isRestoring === user.id ? '...' : 'Sí'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmId(null)}
                                className="rounded-lg bg-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmId(user.id)}
                            className="h-8 border-zinc-200 hover:bg-green-50 hover:text-green-600 dark:border-zinc-800"
                        >
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Restaurar
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Papelera de Usuarios" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            Papelera de Usuarios
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Consulta y recupera los miembros del equipo eliminados.
                        </p>
                    </div>
                    <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                        <Link href={route('users.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Usuarios
                        </Link>
                    </Button>
                </div>

                <GenericTable data={users?.data || []} columns={columns} />

                <Pagination links={users?.links || []} />
            </div>
        </AppLayout>
    );
}
