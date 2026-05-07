import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';

export default function KnowledgeForm({ faq = null, categories = [], onSuccess }) {
    const isEditing = !!faq;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: faq?.title || '',
        content_response: faq?.content_response || '',
        category_id: faq?.category_id?.toString() || '',
        creation_date: faq?.creation_date || new Date().toISOString().split('T')[0],
    });

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
                    onSuccess();
                },
            });
        }
    };

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

            <div className="grid gap-2">
                <Label htmlFor="category_id">Categoría</Label>
                <Select 
                    value={data.category_id} 
                    onValueChange={(value) => setData('category_id', value)}
                >
                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="creation_date">Fecha</Label>
                <Input
                    id="creation_date"
                    type="date"
                    value={data.creation_date}
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
