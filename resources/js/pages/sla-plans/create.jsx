import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Clock } from "lucide-react";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Planes SLA", href: "/sla-plans" },
    { title: "Crear", href: "/sla-plans/create" },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        grace_time_hours: "",
        working_hours: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post("/sla-plans");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Plan SLA" />
            <form
                onSubmit={submit}
                className="flex-1 flex flex-col w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
                {/* Header Interno */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <Link href="/sla-plans">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        Nuevo Plan SLA
                    </h2>
                </div>

                <div className="flex-1 p-8 ml-4">
                    <div className="max-w-xl space-y-10">
                        {/* Campo: Nombre */}
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-s font-bold text-zinc-500">
                                Nombre del plan
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: Gold, Plata, Bronce..."
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="h-12 border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 rounded-xl focus-visible:ring-zinc-500"
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 font-medium">{errors.name}</p>
                            )}
                        </div>

                        {/* Campo: Tiempo de gracia (horas) */}
                        <div className="space-y-3">
                            <Label htmlFor="grace_time_hours" className="text-s font-bold text-zinc-500">
                                Tiempo de gracia (horas)
                            </Label>
                            <Input
                                id="grace_time_hours"
                                type="number"
                                min={1}
                                step={1}
                                placeholder="Ej: 24"
                                value={data.grace_time_hours}
                                onChange={(e) => setData("grace_time_hours", e.target.value)}
                                className="h-12 border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 rounded-xl focus-visible:ring-zinc-500"
                            />
                            {errors.grace_time_hours && (
                                <p className="text-xs text-red-500 font-medium">{errors.grace_time_hours}</p>
                            )}
                        </div>

                        {/* Campo: Horario laboral (Toggle) */}
                        <div
                            className="flex items-center gap-4 group cursor-pointer"
                            onClick={() => setData("working_hours", !data.working_hours)}
                        >
                            <div
                                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                                    data.working_hours
                                        ? "bg-zinc-900 dark:bg-zinc-100"
                                        : "bg-zinc-200 dark:bg-zinc-800"
                                }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full transition-transform ${
                                        data.working_hours
                                            ? "translate-x-4 bg-white dark:bg-zinc-900"
                                            : "translate-x-0 bg-white"
                                    }`}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                    Considerar horario laboral
                                </p>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Si está activo, el tiempo de respuesta solo cuenta en días/hábiles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                    <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" asChild className="text-zinc-500">
                            <Link href="/sla-plans">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 px-8 bg-zinc-900 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-zinc-900/10"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Plan SLA"}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
