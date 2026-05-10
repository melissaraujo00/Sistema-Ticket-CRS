import { GenericTable } from '@/components/GenericTable';
import { Button } from '@/components/ui/button';
import { useDepartmentActions } from '@/hooks/use-department-actions'; // Asumiendo que existe el hook
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Trashed({ departments = [] }) {
    const { restore, isProcessingAction } = useDepartmentActions();
    const [confirmId, setConfirmId] = useState(null);

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const columns = [
        {
            header: 'Departamento',
            className: 'w-1/3',
            render: (dept) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{dept.name}</span>,
        },
        {
            header: 'Área',
            render: (dept) => (
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase dark:bg-zinc-800">
                    {dept.area?.name || 'No asignada'}
                </span>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            render: (dept) => (
                <div className="flex justify-end gap-2">
                    {confirmId === dept.id ? (
                        <div className="animate-in fade-in slide-in-from-right-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-500">¿Restaurar?</span>
                            <button
                                type="button"
                                onClick={() => restore(dept.id, () => setConfirmId(null))}
                                disabled={isProcessingAction === dept.id}
                                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {isProcessingAction === dept.id ? '...' : 'Sí'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmId(null)}
                                className="rounded-lg bg-zinc-200 px-3 py-1 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmId(dept.id)}
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
            <Head title="Papelera de Departamentos" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Papelera de Departamentos</h1>
                        <p className="text-sm text-zinc-500">Consulta y recupera los departamentos eliminados.</p>
                    </div>
                    <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                        <Link href={route('departments.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Departamentos
                        </Link>
                    </Button>
                </div>

                <GenericTable data={departments} columns={columns} />
            </div>
        </AppLayout>
    );
}
