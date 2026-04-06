import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, ListFilter } from "lucide-react";
import DeleteEntityModal from "@/components/DeleteEntityModal";
import { GenericTable } from "@/components/GenericTable";

export default function Prioridades() {

    const { props } = usePage();

    const priorities = props.priorities || [];
    const auth = props.auth || { user: { permissions: [] } };

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const hasPermission = (perm) => auth.user?.permissions?.includes(perm);

    const filteredPriorities = (priorities || []).filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const columns = [
        {
            header: "Prioridad",
            render: (priority) => (
                <span className="font-semibold">{priority.name}</span>
            )
        },
        {
            header: "Color",
            className: "hidden lg:table-cell text-zinc-600",
            render: (priority) => (
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700"
                        style={{ backgroundColor: priority.color }}
                    />
                    <span className="font-mono text-xs">{priority.color}</span>
                </div>
            )
        },
        {
            header: "Nivel",
            className: "hidden md:table-cell text-zinc-600",
            render: (priority) => (
                <span className="font-semibold">{priority.level}</span>
            )
        },
        {
            header: "Acciones",
            render: (priority) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-blue-600">
                        <Link href={`/priorities/${priority.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 hover:text-red-600"
                        onClick={() => {
                            setSelectedPriority(priority);
                            setIsDeleteModalOpen(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AppLayout>
            <Head title="Prioridades" />
            <Toaster position="top-right" richColors />

            <div className="p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Prioridades</h1>
                        <p className="text-zinc-500 text-sm">Gestión de niveles de importancia para los tickets.</p>
                    </div>
                    {"crear prioridad" && (
                        <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                            <Link href="/priorities/create">
                                <Plus className="mr-2 h-4 w-4" />Nueva
                            </Link>
                        </Button>
                    )}
                </div>

                <GenericTable data={filteredPriorities} columns={columns} />
            </div>

            <DeleteEntityModal
                isOpen={isDeleteModalOpen}
                closeModal={() => setIsDeleteModalOpen(false)}
                entity={selectedPriority}
                entityType="Prioridades"
                deleteEndpoint="/priorities"
            />
        </AppLayout>
    );
}