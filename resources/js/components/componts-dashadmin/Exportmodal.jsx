import { useState } from 'react';
import { CheckSquare, FileSpreadsheet, FileText, Loader2, Square, X } from 'lucide-react';

// ─── secciones exportables ────────────────────────────────────────────────────

const SECTIONS = [
    { id: 'kpis',      label: 'Tarjetas KPI'              },
    { id: 'chart_mes', label: 'Datos: Tickets por mes'    },
    { id: 'chart_cat', label: 'Datos: Por categoría'      },
    { id: 'chart_pri', label: 'Datos: Por prioridad'      },
    { id: 'resumen',   label: 'Resumen rápido'            },
    { id: 'agentes',   label: 'Agentes destacados'        },
    { id: 'tabla',     label: 'Tabla de tickets activos'  },
];

// ─── Excel con xlsx ───────────────────────────────────────────────────────────

async function doExportExcel({ selected, data, dateRange }) {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    const addSheet = (name, rows) => {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
    };

    const desde = dateRange.from || 'inicio';
    const hasta = dateRange.to   || 'hoy';

    // portada
    addSheet('Info', [
        ['Reporte Dashboard CRS'],
        ['Período', `${desde} — ${hasta}`],
        ['Generado', new Date().toLocaleDateString('es-SV')],
    ]);

    if (selected.kpis) {
        addSheet('KPIs', [
            ['Métrica', 'Valor', 'Variación'],
            ...data.kpis.map((k) => [k.label, k.value, k.delta]),
        ]);
    }
    if (selected.chart_mes) {
        addSheet('Tickets por Mes', [
            ['Mes', 'Abiertos', 'Resueltos'],
            ...data.ticketsByMonth.map((r) => [r.mes, r.abiertos, r.resueltos]),
        ]);
    }
    if (selected.chart_cat) {
        addSheet('Por Categoría', [
            ['Categoría', 'Porcentaje (%)'],
            ...data.byCategory.map((r) => [r.name, r.value]),
        ]);
    }
    if (selected.chart_pri) {
        addSheet('Por Prioridad', [
            ['Prioridad', 'Total'],
            ...data.byPriority.map((r) => [r.name, r.total]),
        ]);
    }
    if (selected.resumen) {
        addSheet('Resumen Rápido', [
            ['Métrica', 'Valor'],
            ...data.resumen.map((r) => [r.l, r.n]),
        ]);
    }
    if (selected.agentes) {
        addSheet('Agentes', [
            ['Agente', 'Tickets resueltos'],
            ...data.agentes.map((a) => [a.name, a.tickets]),
        ]);
    }
    if (selected.tabla) {
        addSheet('Tickets Activos', [
            ['Código', 'Asunto', 'Categoría', 'Prioridad', 'Progreso (%)'],
            ...data.tickets.map((t) => [
                t.id, t.subject, t.categoryInitial,
                t.priority ?? 'No asignado', t.progress,
            ]),
        ]);
    }

    XLSX.writeFile(wb, `Dashboard_CRS_${desde}_${hasta}.xlsx`);
}

// ─── PDF con jsPDF (texto + tablas, sin imágenes) ─────────────────────────────

async function doExportPDF({ selected, data, dateRange }) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W      = doc.internal.pageSize.getWidth();
    const H      = doc.internal.pageSize.getHeight();
    const M      = 14;   // margen
    const LINE   = 6;
    const desde  = dateRange.from || 'inicio';
    const hasta  = dateRange.to   || 'hoy';
    let   y      = M;

    const checkPage = (needed = 10) => {
        if (y + needed > H - M) { doc.addPage(); y = M; }
    };

    const heading = (text) => {
        checkPage(12);
        doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(30);
        doc.text(text, M, y);
        y += 7;
    };

    const row = (cols, widths, isHeader = false) => {
        checkPage(8);
        const rowH = 7;
        let x = M;
        doc.setFontSize(8).setFont('helvetica', isHeader ? 'bold' : 'normal')
           .setTextColor(isHeader ? 60 : 80);
        cols.forEach((c, i) => {
            doc.text(String(c ?? '—'), x + 1, y + 5, { maxWidth: widths[i] - 2 });
            x += widths[i];
        });
        // línea divisora
        doc.setDrawColor(220).setLineWidth(0.2);
        doc.line(M, y + rowH, W - M, y + rowH);
        y += rowH;
    };

    const table = (headers, widths, dataRows) => {
        row(headers, widths, true);
        dataRows.forEach((r) => row(r, widths));
        y += 4;
    };

    // ── portada ──
    doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(20);
    doc.text('Reporte — Dashboard CRS', M, y + 6);
    y += 12;
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(100);
    doc.text(`Período: ${desde}  →  ${hasta}`, M, y);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-SV')}`, W - M - 40, y);
    y += 10;
    doc.setDrawColor(200).setLineWidth(0.4);
    doc.line(M, y, W - M, y);
    y += 8;

    // ── KPIs ──
    if (selected.kpis) {
        heading('Resumen KPI');
        const cw = [(W - M * 2) * 0.55, (W - M * 2) * 0.25, (W - M * 2) * 0.2];
        table(['Métrica', 'Valor', 'Variación'], cw,
            data.kpis.map((k) => [k.label, k.value, k.delta])
        );
    }

    // ── tickets por mes ──
    if (selected.chart_mes) {
        heading('Tickets por Mes');
        const cw = [(W - M * 2) / 3, (W - M * 2) / 3, (W - M * 2) / 3];
        table(['Mes', 'Abiertos', 'Resueltos'], cw,
            data.ticketsByMonth.map((r) => [r.mes, r.abiertos, r.resueltos])
        );
    }

    // ── por categoría ──
    if (selected.chart_cat) {
        heading('Distribución por Categoría');
        const cw = [(W - M * 2) * 0.6, (W - M * 2) * 0.4];
        table(['Categoría', 'Porcentaje (%)'], cw,
            data.byCategory.map((r) => [r.name, `${r.value}%`])
        );
    }

    // ── por prioridad ──
    if (selected.chart_pri) {
        heading('Tickets por Prioridad');
        const cw = [(W - M * 2) * 0.6, (W - M * 2) * 0.4];
        table(['Prioridad', 'Total tickets'], cw,
            data.byPriority.map((r) => [r.name, r.total])
        );
    }

    // ── resumen ──
    if (selected.resumen) {
        heading('Resumen Rápido');
        const cw = [(W - M * 2) * 0.6, (W - M * 2) * 0.4];
        table(['Métrica', 'Valor'], cw,
            data.resumen.map((r) => [r.l, r.n])
        );
    }

    // ── agentes ──
    if (selected.agentes) {
        heading('Agentes Destacados');
        const cw = [(W - M * 2) * 0.7, (W - M * 2) * 0.3];
        table(['Agente', 'Tickets resueltos'], cw,
            data.agentes.map((a) => [a.name, a.tickets])
        );
    }

    // ── tabla tickets ──
    if (selected.tabla) {
        heading('Tickets Activos');
        const cw = [22, (W - M * 2) - 22 - 18 - 22 - 20, 18, 22, 20];
        table(['Código', 'Asunto', 'Cat.', 'Prioridad', 'Progreso'], cw,
            data.tickets.map((t) => [
                t.id, t.subject, t.categoryInitial,
                t.priority ?? 'N/A', `${t.progress}%`,
            ])
        );
    }

    // numeración de páginas
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(150);
        doc.text(`Página ${p} de ${total}`, W / 2, H - 6, { align: 'center' });
    }

    doc.save(`Dashboard_CRS_${desde}_${hasta}.pdf`);
}

// ─── modal ────────────────────────────────────────────────────────────────────

export default function ExportModal({ open, onClose, staticData, dateRange }) {
    const [selected, setSelected] = useState(
        Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
    );
    const [format,  setFormat]  = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    if (!open) return null;

    const toggle    = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));
    const allOn     = SECTIONS.every((s) => selected[s.id]);
    const toggleAll = () => setSelected(Object.fromEntries(SECTIONS.map((s) => [s.id, !allOn])));
    const noneOn    = SECTIONS.every((s) => !selected[s.id]);

    const handleExport = async () => {
        setError('');
        setLoading(true);
        try {
            if (format === 'excel') {
                await doExportExcel({ selected, data: staticData, dateRange });
            } else {
                await doExportPDF({ selected, data: staticData, dateRange });
            }
            onClose();
        } catch (e) {
            console.error(e);
            setError('Error al exportar. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-sidebar-border bg-white shadow-xl dark:bg-sidebar">

                {/* header */}
                <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
                    <h2 className="text-base font-medium text-gray-900 dark:text-white">Exportar reporte</h2>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-sidebar-accent">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">

                    {/* formato */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Formato</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: 'pdf',   Icon: FileText,        label: 'PDF',   desc: 'Texto + tablas'     },
                                { key: 'excel', Icon: FileSpreadsheet, label: 'Excel', desc: 'Datos tabulares'    },
                            ].map(({ key, Icon, label, desc }) => (
                                <button
                                    key={key}
                                    onClick={() => setFormat(key)}
                                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                        format === key
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-sidebar-border hover:bg-gray-50 dark:hover:bg-sidebar-accent'
                                    }`}
                                >
                                    <Icon size={20} className={format === key ? 'text-blue-500' : 'text-gray-400'} />
                                    <div>
                                        <p className={`text-sm font-medium ${format === key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                                        <p className="text-[10px] text-gray-400">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* secciones */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">¿Qué incluir?</p>
                            <button onClick={toggleAll} className="text-[11px] font-medium text-blue-500 hover:text-blue-600">
                                {allOn ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-sidebar-border">
                            {SECTIONS.map((s, i) => (
                                <button
                                    key={s.id}
                                    onClick={() => toggle(s.id)}
                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-sidebar-accent ${i !== 0 ? 'border-t border-sidebar-border' : ''}`}
                                >
                                    {selected[s.id]
                                        ? <CheckSquare size={15} className="shrink-0 text-blue-500" />
                                        : <Square      size={15} className="shrink-0 text-gray-300" />
                                    }
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* período */}
                    <div className="rounded-lg bg-gray-50 px-4 py-2.5 dark:bg-sidebar-accent">
                        <p className="text-[11px] text-gray-500">
                            Período:{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {dateRange.from || '—'} → {dateRange.to || '—'}
                            </span>
                            {!dateRange.from && !dateRange.to && (
                                <span className="ml-1 text-gray-400">(sin filtro aplicado)</span>
                            )}
                        </p>
                    </div>

                    {/* error */}
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 border-t border-sidebar-border px-5 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-sidebar-accent"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={loading || noneOn}
                        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? <><Loader2 size={14} className="animate-spin" />Exportando...</>
                            : <>{format === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}Exportar {format.toUpperCase()}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}