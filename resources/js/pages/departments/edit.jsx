import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDepartmentActions } from '@/hooks/use-department-actions';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function Edit({ department, areas = [], potentialHeads = [] }) {
    const { form, update, toggleHead } = useDepartmentActions(department);
    const { data, setData, processing, errors } = form;

    const submit = (e) => {
        update(e, department.id);
    };

    return (
        <AppLayout>
            <Head title={`Editar ${department.name}`} />

            <form
                onSubmit={submit}
                className="flex w-full flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* Header con botón de retorno */}
                <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
                    <Button type="button" asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('departments.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Editar Departamento</h2>
                    </div>
                </div>

                {/* Cuerpo del Formulario con Scroll */}
                <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
                    <div className="w-full max-w-2xl space-y-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Nombre */}
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-sm font-bold text-zinc-500">
                                    Nombre del Departamento
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
                            </div>

                            {/* Correo */}
                            <div className="space-y-3">
                                <Label htmlFor="email_department" className="text-sm font-bold text-zinc-500">
                                    Correo Institucional
                                </Label>
                                <Input
                                    id="email_department"
                                    type="email"
                                    value={data.email_department}
                                    onChange={(e) => setData('email_department', e.target.value)}
                                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30"
                                />
                                {errors.email_department && <p className="text-xs font-medium text-red-500">{errors.email_department}</p>}
                            </div>

                            {/* Selector de Área Responsable */}
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="area_id" className="text-sm font-bold text-zinc-500">
                                    Área Responsable
                                </Label>
                                <select
                                    id="area_id"
                                    value={data.area_id}
                                    onChange={(e) => setData('area_id', e.target.value)}
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/30 px-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                >
                                    <option value="">Selecciona un área...</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.area_id && <p className="text-xs font-medium text-red-500">{errors.area_id}</p>}
                            </div>

                            {/* Panel de Jefes con Filtrado Dinámico y Scroll Interno */}
                            <div className="space-y-4 md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-zinc-900/30">
                                <div className="flex flex-col">
                                    <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                        Jefes de Departamento <span className="text-xs font-normal text-zinc-400">(Opcional)</span>
                                    </Label>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Solo se muestran administradores activos asignados al Área seleccionada.
                                    </p>
                                </div>

                                {(() => {
                                    const selectedAreaId = data.area_id?.toString();

                                    // Filtramos los candidatos basándonos en el área seleccionada en el combo box
                                    const availableHeads = potentialHeads.filter(
                                        (user) => user.department?.area_id?.toString() === selectedAreaId
                                    );

                                    if (!selectedAreaId) {
                                        return (
                                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
                                                <p className="text-sm font-medium text-zinc-500 text-center px-4">
                                                    Selecciona un Área arriba para ver los candidatos.
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (availableHeads.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
                                                <p className="px-4 text-center text-sm font-medium text-zinc-500">
                                                    No hay administradores registrados en esta área.
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                                            {availableHeads.map((user) => {
                                                const isSelected = data.head_ids.includes(user.id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={user.id}
                                                        onClick={() => toggleHead(user.id)}
                                                        className={`flex items-center justify-between rounded-xl border p-3 text-sm font-medium transition-all ${
                                                            isSelected
                                                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                                                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                                                        }`}
                                                    >
                                                        <span className="truncate">{user.name}</span>
                                                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                                {errors.head_ids && <p className="text-xs font-medium text-red-500">{errors.head_ids}</p>}
                            </div>

                            {/* Descripción (Opcional) */}
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="description" className="text-sm font-bold text-zinc-500">
                                    Descripción <span className="text-xs font-normal text-zinc-400">(Opcional)</span>
                                </Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe las funciones del departamento..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/30 p-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                                />
                                {errors.description && <p className="text-xs font-medium text-red-500">{errors.description}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer de Acciones */}
                <div className="mt-auto border-t border-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" asChild className="text-zinc-500">
                            <Link href={route('departments.index')}>Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-zinc-900 px-8 font-bold text-white shadow-lg shadow-zinc-900/10 transition-all active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
