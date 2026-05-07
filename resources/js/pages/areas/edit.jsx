import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAreaActions } from '@/hooks/use-area-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useEffect } from 'react';

export default function Edit({ area }) {
    const { form, update } = useAreaActions(area);
    const { data, setData, processing, errors } = form;

    // Extraemos los mensajes flash del backend
    const { flash } = usePage().props;

    // Escuchamos si el backend devuelve un error general
    useEffect(() => {
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const submit = (e) => {
        update(e, area.id);
    };

    return (
        <AppLayout>
            <Head title="Editar Área" />

            <Toaster richColors position="top-right" />

            <form
                onSubmit={submit}
                className="flex w-full flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* HEADER */}
                <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('areas.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Editar Área</h2>
                </div>

                {/* CONTENIDO */}
                <div className="flex flex-1 items-start justify-center p-8">
                    <div className="w-full max-w-2xl space-y-8">
                        {/* NOMBRE */}
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-sm font-bold text-zinc-500">
                                Nombre
                            </Label>

                            <Input
                                id="name"
                                placeholder="Ej: Soporte Técnico"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                            />

                            {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="space-y-3">
                            <Label htmlFor="description" className="text-sm font-bold text-zinc-500">
                                Descripción
                            </Label>

                            <Textarea
                                id="description"
                                placeholder="Describe brevemente el área..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="min-h-[120px] rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                            />

                            {errors.description && <p className="text-xs font-medium text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-auto border-t border-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" asChild className="text-zinc-500">
                            <Link href={route('areas.index')}>Cancelar</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-zinc-900 px-8 font-bold text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar Área'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
