import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import CategoryTable from '@/pages/faqs/CategoryTable.jsx';
import CategoryForm from '@/pages/faqs/CategoryForm.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

export default function Faq({ knowledges = [], categories = [] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Preguntas Frecuentes', href: '/faq' },
    ];

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Centro de Ayuda" />

            <div className="flex h-full w-full flex-col p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centro de Ayuda</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Consulta la información sobre accesos, hardware, software y procesos operativos o gestiona las categorías.
                    </p>
                </div>

                <Tabs defaultValue="faq" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
                        <TabsTrigger value="categories">Categorías</TabsTrigger>
                    </TabsList>

                    <TabsContent value="faq">
                        <div className="dark:bg-sidebar border-sidebar-border overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">Lista de FAQs</h2>
                            {knowledges.length > 0 ? (
                                <ul className="space-y-4">
                                    {knowledges.map((item) => (
                                        <li key={item.id} className="border-b pb-2">
                                            <h3 className="font-medium">{item.title}</h3>
                                            <p className="text-sm text-gray-600">{item.content_response}</p>
                                            <span className="text-xs text-blue-500">{item.category?.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay preguntas frecuentes registradas.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="categories">
                        <div className="dark:bg-sidebar border-sidebar-border overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Categorías</h2>

                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            onClick={handleCreate}
                                            className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {selectedCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {selectedCategory 
                                                    ? 'Modifica el nombre de la categoría seleccionada.' 
                                                    : 'Ingresa el nombre de la nueva categoría para organizar las FAQs.'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <CategoryForm 
                                            category={selectedCategory} 
                                            onSuccess={() => setIsDialogOpen(false)} 
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {categories.length > 0 ? (
                                <CategoryTable 
                                    categories={categories} 
                                    onEdit={handleEdit} 
                                />
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-10">
                                    No hay categorías registradas.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
