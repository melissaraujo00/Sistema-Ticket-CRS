import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { GenericTable } from "@/components/GenericTable";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Planes SLA", href: "/sla-plans" },
    { title: "Eliminados", href: "/sla-plans/trashed" },
];

export default function Trashed() {
    const { props } = usePage();
    const planes = props.planes || [];
    const auth = props.auth // { user: { permissions: [] } };

    const [isRestoring, setIsRestoring] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    const hasPermission = (perm) => auth.user?.permissions?.includes(perm);

    const handleRestore = (id) => {
        setIsRestoring(id);
        router.put(`/sla-plans/${id}/restore`, {}, {
            onSuccess: () => {
                toast.success("Plan SLA restaurado exitosamente.");
                setConfirmId(null);
                setIsRestoring(null);
            },
            onError: () => {
                toast.error("Error al restaurar el Plan SLA.");
                setIsRestoring(null);
            },
        });
    };

    const columns = [
        {
            header: "Nombre",
            render: (plan) => (
                <span className="font-semibold block">{plan.name}</span>
            ),
        },
        {
            header: "Tiempo de gracia (horas)",
            className: "hidden md:table-cell",
            render: (plan) => <span>{plan.grace_time_hours}</span>,
        },
        {
            header: "Horario laboral",
            className: "hidden md:table-cell",
            render: (plan) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.working_hours
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                >
                    {plan.working_hours ? "Sí" : "No"}
                </span>
            ),
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (plan) => (
                <div className="flex justify-end gap-2">
                    {confirmId === plan.id ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500">¿Restaurar?</span>
                            <button
                                type="button"
                                onClick={() => handleRestore(plan.id)}
                                disabled={isRestoring === plan.id}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isRestoring === plan.id ? "Restaurando..." : "Sí"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmId(null)}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                                No
                            </button>
                        </div>
                   ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-600 hover:text-white"
                            onClick={() => setConfirmId(plan.id)}
                        >
                            Restaurar
                        </Button>
                    )} 
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes SLA Eliminados" />
            <Toaster position="top-right" richColors />

            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            Planes SLA Eliminados
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Registros eliminados que pueden ser restaurados.
                        </p>
                    </div>
                    <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                        <Link href="/sla-plans">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Planes SLA
                        </Link>
                    </Button>
                </div>

                <GenericTable data={planes} columns={columns} />
            </div>
        </AppLayout>
    );
}