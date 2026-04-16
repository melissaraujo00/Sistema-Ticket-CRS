import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
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
import { ArrowLeft, Loader2, Paperclip, Ticket, Image as ImageIcon, Pencil, Check, Link } from "lucide-react";
import { route } from "ziggy-js";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: "/tickets" },
    { title: "Crear Ticket", href: "/tickets/create" },
];

export default function Create() {
    const { auth, departments, divisions, helpTopics } = usePage().props;

    const [showPreview, setShowPreview] = useState(false);
    const [dept, setDept] = useState("");
    const [div, setDiv] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        department_id: "",
        division_id: "",
        help_topic_id: "",
        subject: "",
        message: "",
        attach: null,
    });

    const filteredDivisions = dept
        ? divisions.filter((d) => parseInt(d.department_id) === parseInt(dept))
        : [];

    const filteredTopics = div
        ? helpTopics.filter((t) => parseInt(t.division_id) === parseInt(div))
        : [];

    const handleDeptChange = (val) => {
        setDept(val);
        setDiv("");
        setData("department_id", val);
        setData("division_id", "");
        setData("help_topic_id", "");
    };

    const handleDivChange = (val) => {
        setDiv(val);
        setData("division_id", val);
        setData("help_topic_id", "");
    };

    const handleGoToPreview = (e) => {
        e.preventDefault();
        setShowPreview(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post("/tickets", { forceFormData: true });
    };
    if (showPreview) {
        const deptName = departments.find(d => d.id.toString() === data.department_id)?.name || "No especificado";
        const divName = divisions.find(d => d.id.toString() === data.division_id)?.name || "No especificado";
        const topicName = helpTopics.find(t => t.id.toString() === data.help_topic_id)?.name_topic || "No especificado";

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Vista Previa del Ticket" />
                <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
                    <div className="w-full bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 break-words">
                                    {data.subject || "Sin asunto"}
                                </h1>
                                <p className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                                    <i className="fas fa-info-circle"></i> Revisión de borrador antes de envío
                                </p>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                    </span>
                                    Pendiente
                                </span>

                                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex flex-col items-end leading-tight">
                                    <span>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                        {/* Columna de Información General */}
                        <div className="lg:col-span-1">
                            <div className="h-100 bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-700 rounded-xl p-7  py-7 shadow-sm">
                                <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-5">Información General</h2>
                                <div className="space-y-7 text-sm"> {/* Aumenté un poco el espacio interno */}
                                    <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300">Solicitante</span>
                                        <span className="text-zinc-600 dark:text-zinc-400 text-right">{auth.user.name}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300">Email</span>
                                        <span className="text-blue-600 dark:text-blue-400 text-right break-all">{auth.user.email}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300">Departamento</span>
                                        <span className="text-zinc-600 dark:text-zinc-400 text-right">{deptName}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300">División</span>
                                        <span className="text-zinc-600 dark:text-zinc-400 text-right">{divName}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300">Problema</span>
                                        <span className="text-zinc-600 dark:text-zinc-400 text-right font-medium">{topicName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha (Descripción + Adjuntos) */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Descripción del Problema */}
                            <div className="bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-700 rounded-xl p-6 shadow-sm flex-1">
                                <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Descripción del Problema</h2>
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-30 overflow-y-auto">
                                    {data.message || "Sin descripción proporcionada."}
                                </div>
                            </div>

                            {/* Archivos Adjuntos */}

                            <div className="bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-700 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Archivos Adjuntos Preparados</h2>
                                <div className="flex items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800 gap-4">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-md text-blue-600 dark:text-blue-400">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{data.attach.name}</p>
                                    </div>
                                </div>
                            </div>


                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setShowPreview(false)} disabled={processing}>
                                    <Pencil className="w-4 h-4 mr-2" /> Editar Datos
                                </Button>

                                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md" onClick={submit} disabled={processing}>
                                    {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                    Confirmar y Enviar Ticket
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Ticket" />
            <form onSubmit={handleGoToPreview} className="flex flex-col w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                {/* Header */}
                <div className="p-6 border-b flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <Link href="/tickets"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-red-600" /> Nuevo Ticket
                    </h2>
                </div>

                <h1 className="text-2xl font-bold text-red-600 mb-2">
                    Abrir Nuevo Ticket
                </h1>
                <p className="text-sm text-gray-600 mb-6">
                    Rellene el siguiente formulario para abrir un nuevo ticket
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Información del Personal */}
                    <div className="bg-white border border-[#706F6F] rounded-xl p-6">
                        <h2 className="text-red-600 font-semibold mb-6">
                            Información del Personal
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-[#3C3C3B]">Nombre y Apellidos:</Label>
                                <Input
                                    className="col-span-2 border-[#706F6F]"
                                    value={auth.user.name}
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-[#3C3C3B]">Correo Electrónico:</Label>
                                <Input
                                    className="col-span-2 border-[#706F6F]"
                                    value={auth.user.email}
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-[#3C3C3B]">Teléfono:</Label>
                                <div className="col-span-2 flex gap-4">
                                    <Input
                                        className="border-[#706F6F] w-1/2"
                                        value={auth.user.phone_number ?? ""}
                                        disabled
                                    />
                                    <div className="flex items-center gap-2 w-1/2">
                                        <Label className="text-[#3C3C3B]">Ext:</Label>
                                        <Input
                                            className="border-[#706F6F]"
                                            value={auth.user.ext ?? ""}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información de Área */}
                    <div className="bg-white border border-[#706F6F] rounded-xl p-6">
                        <h2 className="text-red-600 font-semibold mb-6">
                            Información de Área
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <Label className="text-[#3C3C3B] w-28">Departamento:</Label>
                                    <Select value={dept} onValueChange={handleDeptChange}>
                                        <SelectTrigger className="border-[#706F6F]">
                                            <SelectValue placeholder="Seleccione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Label className="text-[#3C3C3B] w-20">División:</Label>
                                    <Select value={div} onValueChange={handleDivChange} disabled={!dept}>
                                        <SelectTrigger className="border-[#706F6F]">
                                            <SelectValue placeholder="Seleccione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredDivisions.map((d) => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Label className="text-[#3C3C3B] w-36">Temas de ayuda:</Label>
                                <Select
                                    value={data.help_topic_id}
                                    onValueChange={(val) => setData("help_topic_id", val)}
                                    disabled={!div}
                                >
                                    <SelectTrigger className="border-[#706F6F] w-full">
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTopics.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name_topic}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Errores de validación */}
                            {errors.department_id && <p className="text-red-500 text-xs">{errors.department_id}</p>}
                            {errors.division_id && <p className="text-red-500 text-xs">{errors.division_id}</p>}
                            {errors.help_topic_id && <p className="text-red-500 text-xs">{errors.help_topic_id}</p>}
                        </div>
                    </div>
                </div>

                {/* Mensaje */}
                <div className="bg-white border border-[#3C3C3B] rounded-xl p-6 mt-6">
                    <h2 className="text-red-600 font-bold mb-4">
                        Mensaje a notificar
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Asunto</Label>
                                <Input
                                    value={data.subject}
                                    onChange={(e) => setData("subject", e.target.value)}
                                />
                                {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
                            </div>

                            <div>
                                <Label>Mensaje</Label>
                                <Textarea
                                    rows={5}
                                    value={data.message}
                                    onChange={(e) => setData("message", e.target.value)}
                                />
                                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
                            </div>
                        </div>

                        <div>
                            <Label>Adjuntos</Label>
                            <div className="border-2 border-dashed rounded-xl p-6 text-center">
                                <input
                                    type="file"
                                    onChange={(e) => setData("attach", e.target.files[0])}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-6">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 px-10"
                        >
                            {processing ? "Enviando..." : "Enviar"}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}