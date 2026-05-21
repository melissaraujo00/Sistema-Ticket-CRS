import AreaTableActions from '@/components/areas/AreaTableActions';
import DeleteEntityModal from '@/components/DeleteEntityModal';
import { GenericTable } from '@/components/GenericTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

export default function Areas({ areas }) {
    const { flash } = usePage().props;
    const [selectedArea, setSelectedArea] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const columns = [
        {
            header: 'ID',
            className: 'w-16',
            render: (area) => <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{area.id}</span>,
        },
        {
            header: 'Nombre',
            className: 'w-1/3',
            render: (area) => <span className="font-semibold text-zinc-900 dark:text-zinc-50">{area.name}</span>,
        },
        {
            header: 'Descripción',
            render: (area) => <span className="text-sm text-zinc-600 dark:text-zinc-400">{area.description ?? 'Sin descripción'}</span>,
        },
        {
            header: 'Acciones',
            className: 'text-right w-24',
            render: (area) => (
                <AreaTableActions
                    area={area}
                    onDelete={(a) => {
                        setSelectedArea(a);
                        setIsDeleteOpen(true);
                    }}
                />
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Áreas" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Áreas</h1>
                        <p className="text-sm text-zinc-500">Lista de áreas registradas en el sistema.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <Link href={route('areas.create')}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo
                            </Link>
                        </Button>

                        <Button variant="outline" asChild className="border-zinc-200 dark:border-zinc-800">
                            <Link href={route('areas.trashed')}>
                                <Trash2 className="mr-2 h-4 w-4" /> Ver Borrados
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 3. Tabla con el data seguro */}
                <GenericTable data={areas?.data || []} columns={columns} />

                {/* 4. Renderizamos la paginación del backend */}
                <Pagination links={areas?.links || []} />
            </div>

            <DeleteEntityModal
                isOpen={isDeleteOpen}
                entity={selectedArea}
                entityType="Área"
                deleteEndpoint={route('areas.index')}
                closeModal={() => {
                    setIsDeleteOpen(false);
                    setSelectedArea(null);
                }}
            />
        </AppLayout>
    );
}
