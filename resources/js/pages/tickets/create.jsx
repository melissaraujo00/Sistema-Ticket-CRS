import React, { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Paperclip, Ticket } from "lucide-react";
import { route } from "ziggy-js";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: "/tickets" },
    { title: "Crear Ticket", href: "/tickets/create" },
];

export default function Create() {
    const { auth, departments, divisions, helpTopics } = usePage().props;

    const [dept, setDept] = useState("");
    const [div, setDiv] = useState("");
    const { data, setData, post, processing, errors, progress } = useForm({
        department_id: "",
        division_id: "",
        help_topic_id: "",
        subject: "",
        message: "",
        attach: null,
    });

    const filteredDivisions = dept
        ? divisions.filter((d) => d.department_id === parseInt(dept))
        : divisions;
    const filteredTopics = div
        ? helpTopics.filter((t) => t.division_id === parseInt(div))
        : [];

    const handleDeptChange = (val) => {
        setDept(val);
        setDiv("");
        setData({ ...data, department_id: val, division_id: "", help_topic_id: "" });
    };

    const handleDivChange = (val) => {
        setDiv(val);
        setData({ ...data, division_id: val, help_topic_id: "" });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("tickets.store"));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Ticket" />
            <form onSubmit={submit} className="flex flex-col w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                {/* Header */}
                <div className="p-6 border-b flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <Link href="/tickets"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-red-600" /> Nuevo Ticket
                    </h2>
                </div>

                {/* Formulario en grid */}
                <div className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Solicitante */}
                        <div className="md:col-span-2 space-y-2">
                            <Label>Solicitante</Label>
                            <div className="p-3 rounded-xl border bg-muted/30">
                                <p className="font-bold">{auth.user.name}</p>
                                <p className="text-xs text-muted-foreground">{auth.user.email}</p>
                            </div>
                        </div>

                        {/* Departamento */}
                        <div className="space-y-2">
                            <Label>Departamento *</Label>
                            <Select value={dept} onValueChange={handleDeptChange}>
                                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department_id && <p className="text-xs text-red-500">{errors.department_id}</p>}
                        </div>

                        {/* División */}
                        <div className="space-y-2">
                            <Label>División *</Label>
                            <Select value={div} onValueChange={handleDivChange}>
                                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                <SelectContent>
                                    {filteredDivisions.map(d => (
                                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.division_id && <p className="text-xs text-red-500">{errors.division_id}</p>}
                        </div>

                        {/* Tema de ayuda */}
                        <div className="space-y-2">
                            <Label>Tema de ayuda *</Label>
                            <Select value={data.help_topic_id} onValueChange={val => setData("help_topic_id", val)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                <SelectContent>
                                    {filteredTopics.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.name_topic}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.help_topic_id && <p className="text-xs text-red-500">{errors.help_topic_id}</p>}
                        </div>

                        {/* Asunto */}
                        <div className="space-y-2">
                            <Label>Asunto *</Label>
                            <Input value={data.subject} onChange={e => setData("subject", e.target.value)} placeholder="Ej: Problema con el sistema..." />
                            {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                        </div>

                        {/* Mensaje */}
                        <div className="md:col-span-2 space-y-2">
                            <Label>Descripción *</Label>
                            <Textarea rows={4} value={data.message} onChange={e => setData("message", e.target.value)} placeholder="Detalla el problema..." />
                            {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                        </div>

                        {/* Adjunto */}
                        <div className="md:col-span-2 space-y-2">
                            <Label className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Adjuntar archivo (opcional)</Label>
                            <div className="rounded-xl border border-dashed p-4">
                                <input type="file" onChange={e => setData("attach", e.target.files[0])} className="w-full text-sm file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary/10" />
                                <p className="text-xs text-muted-foreground mt-1">Formatos: JPG, PNG, PDF. Máx 5MB.</p>
                            </div>
                            {errors.attach && <p className="text-xs text-red-500">{errors.attach}</p>}
                            {progress && <div className="h-1 bg-muted rounded-full mt-2"><div className="h-full bg-red-600 rounded-full" style={{ width: `${progress.percentage}%` }} /></div>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-4">
                    <Button variant="ghost" asChild><Link href="/tickets">Cancelar</Link></Button>
                    <Button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Ticket"}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
