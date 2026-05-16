import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import DeleteEntityModal from '@/components/DeleteEntityModal';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function CategoryTable({ categories, onEdit, isTrashed = false }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleRestore = (id) => {
        router.put(route('category.restore', id), {}, {
            onSuccess: () => {
                toast.success('Categoría restaurada correctamente');
            },
            onError: () => {
                toast.error('Hubo un error al restaurar la categoría');
            }
        });
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.id}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {isTrashed ? (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRestore(category.id)}
                                            className="h-8 flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Restaurar
                                        </Button>
                                    ) : (
                                        <>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => onEdit(category)}
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Editar"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDeleteClick(category)}
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Desactivar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => {
                                                    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta categoría?')) {
                                                        router.delete(route('category.force-delete', category.id));
                                                    }
                                                }}
                                                className="h-8 w-8 text-red-800 hover:text-red-900 hover:bg-red-100"
                                                title={category.has_relations ? "No se puede eliminar porque tiene conocimientos asociados" : "Eliminación Permanente"}
                                                disabled={category.has_relations}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DeleteEntityModal
                isOpen={isDeleteModalOpen}
                closeModal={() => setIsDeleteModalOpen(false)}
                entity={categoryToDelete}
                entityType="Categoría"
                deleteEndpoint="/category"
            />
        </>
    );
}
