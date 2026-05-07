import { GenericTable } from '@/components/GenericTable';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteEntityModal from '@/components/DeleteEntityModal';

export default function KnowledgeTable({ knowledges, onEdit }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState(null);

    const handleDeleteClick = (faq) => {
        setFaqToDelete({
            id: faq.id,
            name: faq.title // El modal usa entity.name para mostrar qué se borra
        });
        setIsDeleteModalOpen(true);
    };

    const columns = [
        {
            header: 'Título',
            className: 'text-left max-w-[300px]',
            render: (faq) => (
                <div className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={faq.title}>
                    {faq.title}
                </div>
            )
        },
        {
            header: 'Categoría',
            render: (faq) => (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                    {faq.category?.name || 'Sin categoría'}
                </span>
            )
        },
        {
            header: 'Fecha',
            className: 'hidden md:table-cell',
            render: (faq) => <span className="text-zinc-500">{faq.creation_date}</span>
        },
        {
            header: 'Acciones',
            className: 'text-right',
            render: (faq) => (
                <div className="flex justify-end gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(faq)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(faq)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <GenericTable data={knowledges} columns={columns} />

            <DeleteEntityModal
                isOpen={isDeleteModalOpen}
                closeModal={() => setIsDeleteModalOpen(false)}
                entity={faqToDelete}
                entityType="FAQ"
                deleteEndpoint="/faq"
            />
        </>
    );
}
