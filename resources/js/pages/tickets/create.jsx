import React, { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Preview from "./preview";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Ticket, X, FileText } from "lucide-react";
import { route } from "ziggy-js";
import * as Yup from "yup";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: route("tickets.my") },
    { title: "Crear Ticket", href: "/tickets/create" },
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const ticketSchema = Yup.object().shape({
    department_id: Yup.string().required("El departamento es obligatorio"),
    division_id: Yup.string().required("La división es obligatoria"),
    help_topic_id: Yup.string().required("El tema de ayuda es obligatorio"),
    subject: Yup.string().min(5, "El asunto es muy corto").required("El asunto es obligatorio"),
    message: Yup.string().min(10, "Por favor, explica mejor tu problema").required("El mensaje es obligatorio"),
    attachments: Yup.mixed()
        .nullable()
        .test("fileSize", "Uno o más archivos superan los 10MB", (files) => {
            if (!files || files.length === 0) return true;
            return Array.from(files).every(file => file.size <= MAX_FILE_SIZE);
        })
        .test("fileFormat", "Archivos permitidos: JPG, PNG, PDF, DOC, DOCX", (files) => {
            if (!files || files.length === 0) return true;
            return Array.from(files).every(file => SUPPORTED_FORMATS.includes(file.type));
        })
});


export default function Create() {
    const { auth, departments, divisions, helpTopics } = usePage().props;

    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm(
        "CreateTicketForm",
        {
            department_id: "",
            division_id: "",
            help_topic_id: "",
            subject: "",
            message: "",
            attachments: [],
        }
    );

    const [dept, setDept] = useState(data.department_id || "");
    const [div, setDiv] = useState(data.division_id || "");
    const [previewItem, setPreviewItem] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState(data.attachments || []);

    const filteredDivisions = dept
        ? divisions.filter((d) => parseInt(d.department_id) === parseInt(dept))
        : [];

    const filteredTopics = div
        ? helpTopics.filter((t) => parseInt(t.division_id) === parseInt(div))
        : [];

    const handleDeptChange = (val) => {
        setDept(val);
        setDiv("");
        setData((prev) => ({
            ...prev,
            department_id: val,
            division_id: "",
            help_topic_id: "",
        }));
    };

    const handleDivChange = (val) => {
        setDiv(val);
        setData((prev) => ({
            ...prev,
            division_id: val,
            help_topic_id: "",
        }));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;

        const updatedFiles = [...selectedFiles];
        for (const file of newFiles) {
            const exists = updatedFiles.some(
                (f) => f.name === file.name && f.size === file.size
            );
            if (!exists) updatedFiles.push(file);
        }

        setSelectedFiles(updatedFiles);
        setData("attachments", updatedFiles);
        e.target.value = null;
    };

    const removeFile = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setData("attachments", updatedFiles);
    };

    const handleGoToPreview = async (e) => {
        e.preventDefault();
        clearErrors();
        try {
            await ticketSchema.validate(data, { abortEarly: false });
            setShowPreview(true);
        } catch (validationErrors) {
            validationErrors.inner.forEach((error) => {
                setError(error.path, error.message);
            });
        }
    };

    const submit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        post(route("tickets.store"), {
            forceFormData: true,
        });
    };

    if (showPreview) {
        return (
            <Preview
                data={data}
                auth={auth}
                departments={departments}
                divisions={divisions}
                helpTopics={helpTopics}
                breadcrumbs={breadcrumbs}
                processing={processing}
                onEdit={() => setShowPreview(false)}
                onSubmit={submit}
            />
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Ticket" />

            <form
                onSubmit={handleGoToPreview}
                className="flex w-full flex-col border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-zinc-200 p-6 dark:border-zinc-800">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Link href={route('tickets.my')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        <Ticket className="h-5 w-5 text-red-600 dark:text-red-400" /> Nuevo Ticket
                    </h2>
                </div>

                <div className="space-y-6 p-6">
                    <div>
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Abrir Nuevo Ticket</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Rellene el siguiente formulario para abrir un nuevo ticket</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Información del Personal */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-6 font-semibold text-red-600 dark:text-red-400">Información del Personal</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">Nombre y Apellidos:</Label>
                                    <Input
                                        className="col-span-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                                        value={auth.user.name}
                                        disabled
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">Codigo Institucional:</Label>
                                    <Input
                                        className="col-span-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                                        value={auth.user.institution_code}
                                        disabled
                                    />
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">Correo Electrónico:</Label>
                                    <Input
                                        className="col-span-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                                        value={auth.user.email}
                                        disabled
                                    />
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">Teléfono:</Label>
                                    <div className="col-span-2 flex gap-4">
                                        <Input
                                            className="w-1/2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                                            value={auth.user.phone_number ?? ''}
                                            disabled
                                        />
                                        <div className="flex w-1/2 items-center gap-2">
                                            <Label className="text-zinc-700 dark:text-zinc-300">Ext:</Label>
                                            <Input
                                                className="border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                                                value={auth.user.ext ?? ''}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de Área */}
                        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-6 font-semibold text-red-600 dark:text-red-400">Información de Área</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <Label className="w-28 text-zinc-700 dark:text-zinc-300">Departamento:</Label>
                                        <Select value={dept} onValueChange={handleDeptChange}>
                                            <SelectTrigger className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
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
                                        <Label className="w-20 text-zinc-700 dark:text-zinc-300">División:</Label>
                                        <Select value={div} onValueChange={handleDivChange} disabled={!dept}>
                                            <SelectTrigger className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
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
                                <div className="flex justify-between">
                                    {errors.department_id && <p className="text-xs text-red-600 dark:text-red-400">{errors.department_id}</p>}
                                    {errors.division_id && <p className="text-xs text-red-600 dark:text-red-400">{errors.division_id}</p>}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Label className="w-36 text-zinc-700 dark:text-zinc-300">Temas de ayuda:</Label>
                                    <Select value={data.help_topic_id} onValueChange={(val) => setData('help_topic_id', val)} disabled={!div}>
                                        <SelectTrigger className="w-full border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
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
                                {errors.help_topic_id && <p className="text-xs text-red-600 dark:text-red-400">{errors.help_topic_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Mensaje */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 font-bold text-red-600 dark:text-red-400">Mensaje a notificar</h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-zinc-700 dark:text-zinc-300">Asunto</Label>
                                    <Input
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                    {errors.subject && <p className="text-xs text-red-600 dark:text-red-400">{errors.subject}</p>}
                                </div>

                                <div>
                                    <Label className="text-zinc-700 dark:text-zinc-300">Mensaje</Label>
                                    <Textarea
                                        rows={5}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                    {errors.message && <p className="text-xs text-red-600 dark:text-red-400">{errors.message}</p>}
                                </div>
                            </div>

                            <div>
                                <Label className="text-zinc-700 dark:text-zinc-300">Adjuntos (máx. 10MB por archivo)</Label>
                                <div className="relative">
                                    <div className="mt-1 rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Seleccionar archivos
                                        </label>
                                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                            Puede seleccionar múltiples archivos (máx. 10MB c/u)
                                        </p>
                                        {errors.attachments && <p className="text-xs text-red-600 dark:text-red-400">{errors.attachments}</p>}
                                    </div>
                                </div>
                                {selectedFiles.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {selectedFiles.map((file, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between rounded-md bg-zinc-100 p-2 text-sm dark:bg-zinc-800"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt="Vista previa"
                                                            className="h-6 w-6 rounded object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-75 transition-opacity"
                                                            onClick={() => setPreviewItem({ url: URL.createObjectURL(file), type: 'image' })}
                                                        />
                                                    ) : file.type === 'application/pdf' ? (
                                                        <div
                                                            className="p-1 rounded cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                                            title="Ver documento PDF"
                                                            onClick={() => setPreviewItem({ url: URL.createObjectURL(file), type: 'pdf' })}
                                                        >
                                                            <FileText className="h-5 w-5 text-red-500 hover:text-red-600" />
                                                        </div>
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-zinc-500" />
                                                    )}
                                                    <span className="max-w-50 truncate text-zinc-700 dark:text-zinc-300">{file.name}</span>
                                                    <span className="text-xs text-zinc-500">({(file.size / 1024).toFixed(0)} KB)</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-600 hover:text-red-800"
                                                    onClick={() => removeFile(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.attachments && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.attachments}</p>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Button type="submit" disabled={processing} className="bg-red-600 px-10 text-white hover:bg-red-700">
                                {processing ? 'Enviando...' : 'Enviar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
            {previewItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setPreviewItem(null)}
                >
                    <div className="relative flex flex-col items-center">
                        <Button
                            type="button"
                            variant="ghost"
                            className="absolute -right-4 -top-12 text-white hover:bg-transparent hover:text-red-400"
                            onClick={() => setPreviewItem(null)}
                        >
                            <X className="h-8 w-8" />
                        </Button>

                        {previewItem.type === 'image' ? (
                            <img
                                src={previewItem.url}
                                alt="Vista previa grande"
                                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <iframe
                                src={previewItem.url}
                                title="Vista previa PDF"
                                className="h-[85vh] w-[90vw] md:w-[70vw] rounded-lg shadow-2xl bg-white"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}