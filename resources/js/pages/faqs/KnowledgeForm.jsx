import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useRef } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

export default function KnowledgeForm({ faq = null, categories = [], onSuccess }) {
    const isEditing = !!faq;
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: faq?.title || '',
        content_response: faq?.content_response || '',
        category_id: faq?.category_id?.toString() || '',
        creation_date: faq?.creation_date || new Date().toISOString().split('T')[0],
    });

    // Sincronizar nombre de categoría seleccionada para el input
    useEffect(() => {
        if (data.category_id) {
            const selected = categories.find(c => c.id.toString() === data.category_id);
            if (selected) setSearchTerm(selected.name);
        }
    }, [data.category_id, categories]);

    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (faq) {
            setData({
                title: faq.title,
                content_response: faq.content_response,
                category_id: faq.category_id.toString(),
                creation_date: faq.creation_date,
            });
        } else {
            reset();
        }
    }, [faq]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                // Si cerramos y no hay coincidencia exacta, restauramos el nombre anterior
                const selected = categories.find(c => c.id.toString() === data.category_id);
                if (selected) {
                    setSearchTerm(selected.name);
                } else if (!data.category_id) {
                    setSearchTerm('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [data.category_id, categories]);

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('faq.update', faq.id), {
                onSuccess: () => onSuccess(),
            });
        } else {
            post(route('faq.store'), {
                onSuccess: () => {
                    reset();
                    setSearchTerm('');
                    onSuccess();
                },
            });
        }
    };

    const handleSelectCategory = (category) => {
        setData('category_id', category.id.toString());
        setSearchTerm(category.name);
        setIsOpen(false);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Pregunta / Título</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Ej. ¿Cómo solicito un nuevo teclado?"
                    className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-2 relative" ref={dropdownRef}>
                <Label htmlFor="category_search">Categoría</Label>
                <div className="relative">
                    <Input
                        id="category_search"
                        type="text"
                        placeholder="Busca o selecciona una categoría..."
                        value={searchTerm}
                        onFocus={() => setIsOpen(true)}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        className={errors.category_id ? 'border-red-500 pr-10' : 'pr-10'}
                        autoComplete="off"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                        {searchTerm ? <Check className="h-4 w-4 text-green-500" /> : <Search className="h-4 w-4" />}
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleSelectCategory(category)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-between ${
                                        data.category_id === category.id.toString() ? 'bg-zinc-50 dark:bg-zinc-900 font-medium' : ''
                                    }`}
                                >
                                    {category.name}
                                    {data.category_id === category.id.toString() && (
                                        <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-zinc-500 text-center italic">
                                No se encontraron categorías
                            </div>
                        )}
                    </div>
                )}
                {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="creation_date">Fecha</Label>
                <Input
                    id="creation_date"
                    type="date"
                    value={data.creation_date}
                    max={today}
                    onChange={(e) => setData('creation_date', e.target.value)}
                    className={errors.creation_date ? 'border-red-500' : ''}
                />
                {errors.creation_date && <p className="text-xs text-red-500">{errors.creation_date}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="content_response">Respuesta</Label>
                <Textarea
                    id="content_response"
                    value={data.content_response}
                    onChange={(e) => setData('content_response', e.target.value)}
                    placeholder="Escribe la solución detallada aquí..."
                    className={errors.content_response ? 'border-red-500' : ''}
                    rows={4}
                />
                {errors.content_response && <p className="text-xs text-red-500">{errors.content_response}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onSuccess()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
