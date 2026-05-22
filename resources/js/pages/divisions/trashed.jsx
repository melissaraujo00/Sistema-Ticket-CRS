import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDivisionActions } from '@/hooks/use-division-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Trashed({ divisions, filters = {} }) {
    const { restore, isProcessingAction } = useDivisionActions();
    const [confirmId, setConfirmId] = useState(null);

    // Estados para la búsqueda
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Efecto de búsqueda con debounce
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(route('divisions.trashed'), { search: searchTerm }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const columns = [
        {
            header: 'División',
            className: 'w-1/4',
            render: (division) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{division.name}</span>,
        },
        {
            header: 'Departamento',
            render: (division) => (
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:bg-zinc-800">
                    {division.department?.name || 'No asignado'}
                </span>
            ),
        },
        {
            header: 'Área',
            render: (division) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{division.department?.area?.name || 'No asignado'}</span>
            ),
        },
        {
            header: 'Características',
            render: (division) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {division.characteristics || <span className="text-zinc-400 italic">Sin características</span>}
                </span>
            ),
        },
        {
            header: 'Acciones',
            className: 'text-right',
            render: (division) => (
                <div className="flex justify-end gap-2">
                    {confirmId === division.id ? (
                        <div className="animate-in fade-in slide-in-from-right-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-500">¿Restaurar?</span>
                            <button
                                type="button"
                                onClick={() => restore(division.id, () => setConfirmId(null))}
                                disabled={isProcessingAction === division.id}
                                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {isProcessingAction === division.id ? '...' : 'Sí'}
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
                            onClick={() => setConfirmId(division.id)}
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
            <Head title="Papelera de Divisiones" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Papelera de Divisiones</h1>
                        <p className="text-sm text-zinc-500">Consulta y recupera las divisiones eliminadas.</p>
                    </div>
                    <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                        <Link href={route('divisions.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Divisiones
                        </Link>
                    </Button>
                </div>

                {/* UI de Búsqueda */}
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="relative w-full md:w-1/3">
                        <label htmlFor="search-trashed-divisions" className="sr-only">
                            Buscar en papelera
                        </label>
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            id="search-trashed-divisions"
                            placeholder="Buscar división borrada..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border-zinc-200 bg-white pl-9 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>
                </div>

                <GenericTable data={divisions?.data || []} columns={columns} />

                <Pagination links={divisions?.links || []} />
            </div>
        </AppLayout>
    );
}
