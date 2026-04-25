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
    { title: "Mis Tickets", href: "/tickets" },
    { title: "Crear Ticket", href: "/tickets/create" },
];

const ticketSchema = Yup.object().shape({
    department_id: Yup.string().required("El departamento es obligatorio"),
    division_id: Yup.string().required("La división es obligatoria"),
    help_topic_id: Yup.string().required("El tema de ayuda es obligatorio"),
    subject: Yup.string().min(5, "El asunto es muy corto").required("El asunto es obligatorio"),
    message: Yup.string().min(10, "Por favor, explica mejor tu problema").required("El mensaje es obligatorio"),
});

export default function Create() {
    const { auth, departments, divisions, helpTopics } = usePage().props;

    const [showPreview, setShowPreview] = useState(false);
    const [dept, setDept] = useState("");
    const [div, setDiv] = useState("");

    // Estado para los archivos seleccionados (array de File)
    const [selectedFiles, setSelectedFiles] = useState([]);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        department_id: "",
        division_id: "",
        help_topic_id: "",
        subject: "",
        message: "",
        attachments: [], // será un array de archivos
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

    // Manejar selección de archivos (múltiples)
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
    // Eliminar un archivo de la lista
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
                className="flex flex-col w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8"
                    >
                        <Link href="/tickets">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                        <Ticket className="h-5 w-5 text-red-600 dark:text-red-400" /> Nuevo Ticket
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
                            Abrir Nuevo Ticket
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Rellene el siguiente formulario para abrir un nuevo ticket
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información del Personal */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                            <h2 className="text-red-600 dark:text-red-400 font-semibold mb-6">
                                Información del Personal
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">
                                        Nombre y Apellidos:
                                    </Label>
                                    <Input
                                        className="col-span-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                                        value={auth.user.name}
                                        disabled
                                    />
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">
                                        Correo Electrónico:
                                    </Label>
                                    <Input
                                        className="col-span-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                                        value={auth.user.email}
                                        disabled
                                    />
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-zinc-700 dark:text-zinc-300">
                                        Teléfono:
                                    </Label>
                                    <div className="col-span-2 flex gap-4">
                                        <Input
                                            className="border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 w-1/2"
                                            value={auth.user.phone_number ?? ""}
                                            disabled
                                        />
                                        <div className="flex items-center gap-2 w-1/2">
                                            <Label className="text-zinc-700 dark:text-zinc-300">
                                                Ext:
                                            </Label>
                                            <Input
                                                className="border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                                                value={auth.user.ext ?? ""}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de Área */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                            <h2 className="text-red-600 dark:text-red-400 font-semibold mb-6">
                                Información de Área
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <Label className="w-28 text-zinc-700 dark:text-zinc-300">
                                            Departamento:
                                        </Label>
                                        <Select
                                            value={dept}
                                            onValueChange={handleDeptChange}
                                        >
                                            <SelectTrigger className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                                                <SelectValue placeholder="Seleccione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((d) => (
                                                    <SelectItem
                                                        key={d.id}
                                                        value={d.id.toString()}
                                                    >
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Label className="w-20 text-zinc-700 dark:text-zinc-300">
                                            División:
                                        </Label>
                                        <Select
                                            value={div}
                                            onValueChange={handleDivChange}
                                            disabled={!dept}
                                        >
                                            <SelectTrigger className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                                                <SelectValue placeholder="Seleccione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredDivisions.map((d) => (
                                                    <SelectItem
                                                        key={d.id}
                                                        value={d.id.toString()}
                                                    >
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    {errors.department_id && (
                                        <p className="text-red-600 dark:text-red-400 text-xs">
                                            {errors.department_id}
                                        </p>
                                    )}
                                    {errors.division_id && (
                                        <p className="text-red-600 dark:text-red-400 text-xs">
                                            {errors.division_id}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Label className="w-36 text-zinc-700 dark:text-zinc-300">
                                        Temas de ayuda:
                                    </Label>
                                    <Select
                                        value={data.help_topic_id}
                                        onValueChange={(val) =>
                                            setData("help_topic_id", val)
                                        }
                                        disabled={!div}
                                    >
                                        <SelectTrigger className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 w-full">
                                            <SelectValue placeholder="Seleccione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredTopics.map((t) => (
                                                <SelectItem
                                                    key={t.id}
                                                    value={t.id.toString()}
                                                >
                                                    {t.name_topic}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.help_topic_id && (
                                    <p className="text-red-600 dark:text-red-400 text-xs">
                                        {errors.help_topic_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mensaje */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                        <h2 className="text-red-600 dark:text-red-400 font-bold mb-4">
                            Mensaje a notificar
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-zinc-700 dark:text-zinc-300">
                                        Asunto
                                    </Label>
                                    <Input
                                        value={data.subject}
                                        onChange={(e) =>
                                            setData("subject", e.target.value)
                                        }
                                        className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                    />
                                    {errors.subject && (
                                        <p className="text-red-600 dark:text-red-400 text-xs">
                                            {errors.subject}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-zinc-700 dark:text-zinc-300">
                                        Mensaje
                                    </Label>
                                    <Textarea
                                        rows={5}
                                        value={data.message}
                                        onChange={(e) =>
                                            setData("message", e.target.value)
                                        }
                                        className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                    />
                                    {errors.message && (
                                        <p className="text-red-600 dark:text-red-400 text-xs">
                                            {errors.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label className="text-zinc-700 dark:text-zinc-300">
                                    Adjuntos (máx. 10MB por archivo)
                                </Label>
                               <div className="relative">
                                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center mt-1">
                                        {/* Input file oculto */}
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            id="file-upload"
                                        />
                                        {/* Botón personalizado */}
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Seleccionar archivos
                                        </label>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                            Puede seleccionar múltiples archivos (máx. 10MB c/u)
                                        </p>
                                    </div>
                                </div>
                                {selectedFiles.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {selectedFiles.map((file, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between text-sm bg-zinc-100 dark:bg-zinc-800 p-2 rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-zinc-500" />
                                                    <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        ({(file.size / 1024).toFixed(0)} KB)
                                                    </span>
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
                                {errors.attachments && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                                        {errors.attachments}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-red-600 hover:bg-red-700 text-white px-10"
                            >
                                {processing ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
