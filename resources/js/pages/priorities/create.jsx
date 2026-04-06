import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, PlusCircle, Palette, Check } from "lucide-react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        color: "#3b82f6",
        level: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post("/priorities");
    };

    return (
        <AppLayout>
            <Head title="Nueva Prioridad" />
            <form
                onSubmit={submit}
                className="flex-1 flex flex-col w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
                {/* Header Interno */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <Link href="/priorities"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Nueva Prioridad</h2>
                </div>

                <div className="flex-1 p-8 ml-4 ">
                    <div className="max-w-xl space-y-10">

                        {/* Campo: Nombre */}
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-s font-bold  text-zinc-500">
                                Nombre de la Prioridad
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: Alta, Media, Baja..."
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="h-12 border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 rounded-xl focus-visible:ring-zinc-500"
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                        </div>

                        {/* Campo: Color */}
                        <div className="space-y-3">
                            <Label className="text-s font-bold text-zinc-500">Color</Label>
                            <div className="flex items-center gap-4 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 w-fit">
                                <div
                                    className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm relative overflow-hidden"
                                    style={{ backgroundColor: data.color }}
                                >
                                    <input
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData("color", e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                    />
                                </div>
                                <div className="pr-4">
                                    <p className="text-sm font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">{data.color}</p>
                                    <p className="text-[10px] text-zinc-400">Click para cambiar</p>
                                </div>
                            </div>
                        </div>

                        {/* Campo: Nivel  */}
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setData("level", !data.level)}>
                            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${data.level ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                <div className={`w-4 h-4 rounded-full transition-transform ${data.level ? 'translate-x-4 bg-white dark:bg-zinc-900' : 'translate-x-0 bg-white'}`} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Marcar como nivel crítico</p>
                                <p className="text-xs text-zinc-500 font-medium">Esto resaltará las tareas asociadas.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                    <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" asChild className="text-zinc-500">
                            <Link href="/priorities">Cancelar</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 px-8 bg-zinc-900 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-zinc-900/10"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Prioridad"}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}