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
import KnowledgeTable from '@/pages/faqs/KnowledgeTable.jsx';
import KnowledgeForm from '@/pages/faqs/KnowledgeForm.jsx';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button.jsx';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

export default function Faq({ knowledges = { data: [], links: [] }, categories = [] }) {
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState(null);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Preguntas Frecuentes', href: '/faq' },
    ];

    const handleCategoryEdit = (category) => {
        setSelectedCategory(category);
        setIsCategoryDialogOpen(true);
    };

    const handleCategoryCreate = () => {
        setSelectedCategory(null);
        setIsCategoryDialogOpen(true);
    };

    const handleFaqEdit = (faq) => {
        setSelectedFaq(faq);
        setIsFaqDialogOpen(true);
    };

    const handleFaqCreate = () => {
        setSelectedFaq(null);
        setIsFaqDialogOpen(true);
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
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lista de FAQs</h2>

                                <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            onClick={handleFaqCreate}
                                            className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Nuevo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {selectedFaq ? 'Editar FAQ' : 'Agregar Nueva FAQ'}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {selectedFaq 
                                                    ? 'Modifica los detalles de la pregunta frecuente.' 
                                                    : 'Ingresa los detalles para crear una nueva pregunta frecuente.'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <KnowledgeForm 
                                            faq={selectedFaq} 
                                            categories={categories}
                                            onSuccess={() => setIsFaqDialogOpen(false)} 
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {knowledges.data.length > 0 ? (
                                <>
                                    <KnowledgeTable 
                                        knowledges={knowledges.data} 
                                        onEdit={handleFaqEdit} 
                                    />
                                    <Pagination links={knowledges.links} />
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-10">
                                    No hay preguntas frecuentes registradas.
                                </p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="categories">
                        <div className="dark:bg-sidebar border-sidebar-border overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Categorías</h2>

                                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            onClick={handleCategoryCreate}
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
                                            onSuccess={() => setIsCategoryDialogOpen(false)} 
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {categories.length > 0 ? (
                                <CategoryTable 
                                    categories={categories} 
                                    onEdit={handleCategoryEdit} 
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
