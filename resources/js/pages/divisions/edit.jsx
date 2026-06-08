import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDivisionActions } from '@/hooks/use-division-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Edit({ division, departments = [] }) {
    const { form, update } = useDivisionActions(division);
    const { data, setData, processing, errors } = form;

    const submit = (e) => {
        update(e, division.id);
    };

    return (
        <AppLayout>
            <Head title={`Editar ${division.name}`} />

            <form
                onSubmit={submit}
                className="flex w-full flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
                <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
                    <Button type="button" asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('divisions.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            Editar División
                        </h2>
                        <p className="text-sm text-zinc-500">
                            Actualiza la información de {division.name}.
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
                    <div className="w-full max-w-2xl space-y-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-sm font-bold text-zinc-500">
                                    Nombre
                                </Label>

                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Ej: Soporte Técnico"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />

                                {errors.name && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="department_id" className="text-sm font-bold text-zinc-500">
                                    Departamento
                                </Label>

                                <select
                                    id="department_id"
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">Selecciona un departamento...</option>

                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.department_id && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.department_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="characteristics" className="text-sm font-bold text-zinc-500">
                                    Características{' '}
                                    <span className="text-xs font-normal text-zinc-400">
                                        (Opcional)
                                    </span>
                                </Label>

                                <textarea
                                    id="characteristics"
                                    placeholder="Describe brevemente las características de esta división..."
                                    value={data.characteristics}
                                    onChange={(e) => setData('characteristics', e.target.value)}
                                    rows="4"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/30 p-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                />

                                {errors.characteristics && (
                                    <p className="text-xs font-medium text-red-500">
                                        {errors.characteristics}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" asChild className="text-zinc-500">
                            <Link href={route('divisions.index')}>Cancelar</Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-zinc-900 px-8 font-bold text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}