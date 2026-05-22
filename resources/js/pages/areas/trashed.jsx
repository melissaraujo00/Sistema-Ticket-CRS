import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAreaActions } from '@/hooks/use-area-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Trashed({ areas, filters = {} }) {
    const { restore, isProcessingAction } = useAreaActions();
    const [confirmId, setConfirmId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { flash } = usePage().props;
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Efecto de búsqueda con debounce (Apunta a areas.trashed)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(route('areas.trashed'), { search: searchTerm }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const columns = [
        {
            header: 'Nombre',
            className: 'w-1/3',
            render: (area) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{area.name}</span>,
        },
        {
            header: 'Descripción',
            render: (area) => <span className="text-sm text-zinc-500">{area.description || 'Sin descripción'}</span>,
        },
        {
            header: 'Acciones',
            className: 'text-right',
            render: (area) => (
                <div className="flex justify-end gap-2">
                    {confirmId === area.id ? (
                        <div className="animate-in fade-in slide-in-from-right-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-500">¿Restaurar?</span>
                            <button
                                type="button"
                                onClick={() => restore(area.id, () => setConfirmId(null))}
                                disabled={isProcessingAction === area.id}
                                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {isProcessingAction === area.id ? '...' : 'Sí'}
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
                            onClick={() => setConfirmId(area.id)}
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
            <Head title="Papelera de Áreas" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Papelera de Áreas</h1>
                        <p className="text-sm text-zinc-500">Consulta y recupera las áreas eliminadas del sistema.</p>
                    </div>
                    <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                        <Link href={route('areas.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Áreas
                        </Link>
                    </Button>
                </div>

                {/* UI de Búsqueda */}
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="relative w-full md:w-1/3">
                        <label htmlFor="search-trashed-areas" className="sr-only">
                            Buscar en papelera
                        </label>
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            id="search-trashed-areas"
                            placeholder="Buscar área borrada..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border-zinc-200 bg-white pl-9 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>
                </div>

                <GenericTable data={areas?.data || []} columns={columns} />
                <Pagination links={areas?.links || []} />
            </div>
        </AppLayout>
    );
}
