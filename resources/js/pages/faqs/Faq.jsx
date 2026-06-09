import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export default function Faq({ knowledges = { data: [], links: [] }, categories = [], filters = {} }) {
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState(null);

    // Estados para filtros
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [showDeleted, setShowDeleted] = useState(filters.show_deleted || false);
    const [showDeletedCategories, setShowDeletedCategories] = useState(filters.show_deleted_categories || false);

    const isFirstRender = useRef(true);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Preguntas Frecuentes', href: '/faq' },
    ];

    // Lógica de filtrado
    const updateFilters = useCallback(
        debounce((newSearch, newCategory, newShowDeleted, newShowDeletedCategories) => {
            const params = {};
            if (newSearch) params.search = newSearch;
            if (newCategory && newCategory !== 'all') params.category_id = newCategory;
            if (newShowDeleted) params.show_deleted = true;
            if (newShowDeletedCategories) params.show_deleted_categories = true;

            router.get(route('faq.index'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300),
        []
    );

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        updateFilters(search, categoryId, showDeleted, showDeletedCategories);
    }, [search, categoryId, showDeleted, showDeletedCategories]);

    const handleClearFilters = () => {
        setSearch('');
        setCategoryId('all');
        setShowDeleted(false);
        setShowDeletedCategories(false);
    };

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
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {showDeleted ? 'FAQs Desactivadas' : 'Lista de FAQs'}
                                    </h2>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDeleted(!showDeleted)}
                                            className={showDeleted ? "bg-zinc-100 text-zinc-900 border-zinc-300" : ""}
                                        >
                                            {showDeleted ? (
                                                <><Eye className="mr-2 h-4 w-4" /> Ver Activas</>
                                            ) : (
                                                <><EyeOff className="mr-2 h-4 w-4" /> Ver Desactivados</>
                                            )}
                                        </Button>

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
                                </div>

                                {/* Barra de Filtros */}
                                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar por título..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    {!showDeleted && (
                                        <div className="w-full sm:w-[200px]">
                                            <Select value={categoryId} onValueChange={setCategoryId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {(search || (categoryId !== 'all') || showDeleted) && (
                                        <Button 
                                            variant="ghost" 
                                            onClick={handleClearFilters}
                                            className="h-9 px-2 text-zinc-500 hover:text-zinc-900"
                                        >
                                            <X className="mr-2 h-4 w-4" /> Limpiar
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {knowledges.data.length > 0 ? (
                                <>
                                    <KnowledgeTable 
                                        knowledges={knowledges.data} 
                                        onEdit={handleFaqEdit} 
                                        isTrashed={showDeleted}
                                    />
                                    <Pagination links={knowledges.links} />
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-sm text-gray-500">
                                        No se encontraron preguntas frecuentes {showDeleted ? 'desactivadas' : 'con los filtros aplicados'}.
                                    </p>
                                    {(search || categoryId !== 'all' || showDeleted) && (
                                        <Button 
                                            variant="link" 
                                            onClick={handleClearFilters}
                                            className="mt-2 text-blue-600"
                                        >
                                            Limpiar todos los filtros
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="categories">
                        <div className="dark:bg-sidebar border-sidebar-border overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {showDeletedCategories ? 'Categorías Desactivadas' : 'Gestión de Categorías'}
                                </h2>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeletedCategories(!showDeletedCategories)}
                                        className={showDeletedCategories ? "bg-zinc-100 text-zinc-900 border-zinc-300" : ""}
                                    >
                                        {showDeletedCategories ? (
                                            <><Eye className="mr-2 h-4 w-4" /> Ver Activas</>
                                        ) : (
                                            <><EyeOff className="mr-2 h-4 w-4" /> Ver Desactivados</>
                                        )}
                                    </Button>

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
                            </div>

                            {categories.length > 0 ? (
                                <CategoryTable 
                                    categories={categories} 
                                    onEdit={handleCategoryEdit} 
                                    isTrashed={showDeletedCategories}
                                />
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-10">
                                    No hay categorías {showDeletedCategories ? 'desactivadas' : 'registradas'}.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
