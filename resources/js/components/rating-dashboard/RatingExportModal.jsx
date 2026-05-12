import { useState } from 'react';
import { CheckSquare, FileSpreadsheet, FileText, Loader2, Square, X } from 'lucide-react';

// ─── secciones exportables ────────────────────────────────────────────────────

const SECTIONS = [
    { id: 'kpis',         label: 'Resumen General (KPIs)'     },
    { id: 'rankings',     label: 'Ranking de Técnicos'        },
    { id: 'tendencia',    label: 'Tendencia Mensual'          },
    { id: 'distribucion', label: 'Distribución de Estrellas'  },
    { id: 'departamentos', label: 'Desempeño por Departamento' },
];

// ─── Excel con xlsx ───────────────────────────────────────────────────────────

async function doExportExcel({ selected, data }) {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    const addSheet = (name, rows) => {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
    };

    // portada
    addSheet('Info', [
        ['Reporte de Rating de Técnicos'],
        ['Generado', new Date().toLocaleDateString('es-SV')],
    ]);

    if (selected.kpis) {
        addSheet('Resumen', [
            ['Métrica', 'Valor'],
            ['Rating Promedio', data.stats.ratingAverage],
            ['Tickets Resueltos', data.stats.ticketsResolved],
            ['Tiempo Promedio (h)', data.stats.averageTime],
            ['Técnicos Activos', data.stats.activeTechnicians],
        ]);
    }
    if (selected.rankings) {
        addSheet('Ranking Técnicos', [
            ['Nombre', 'Departamento', 'Rating', 'Tickets Resueltos', 'Tiempo Promedio', 'Estado'],
            ...data.rankings.map((t) => [
                t.name, t.department, t.rating, t.tickets_resolved, t.average_time, t.status
            ]),
        ]);
    }
    if (selected.tendencia) {
        addSheet('Tendencia Mensual', [
            ['Mes', 'Año', 'Rating Promedio'],
            ...data.monthlyTrend.map((m) => [m.month || m.month_name, m.year, m.rating]),
        ]);
    }
    if (selected.distribucion) {
        addSheet('Distribución Estrellas', [
            ['Estrellas', 'Total Votos'],
            ...data.distribution.map((d) => [`${d.score} Estrellas`, d.total || d.count]),
        ]);
    }
    if (selected.departamentos) {
        addSheet('Departamentos', [
            ['Departamento', 'Rating Promedio', 'Total Tickets', 'Satisfacción (%)'],
            ...data.departmentPerformance.map((d) => [
                d.name, d.average_rating || d.rating, d.total_tickets || d.tickets, d.satisfaction_pct || d.satisfaction
            ]),
        ]);
    }

    XLSX.writeFile(wb, `Reporte_Rating_Tecnicos_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ─── PDF con jsPDF ────────────────────────────────────────────────────────────

async function doExportPDF({ selected, data }) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W      = doc.internal.pageSize.getWidth();
    const H      = doc.internal.pageSize.getHeight();
    const M      = 14;   
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
    doc.text('Reporte — Rating de Técnicos', M, y + 6);
    y += 12;
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-SV')}`, M, y);
    y += 10;
    doc.setDrawColor(200).setLineWidth(0.4);
    doc.line(M, y, W - M, y);
    y += 8;

    // ── KPIs ──
    if (selected.kpis) {
        heading('Resumen General');
        const cw = [(W - M * 2) * 0.7, (W - M * 2) * 0.3];
        table(['Métrica', 'Valor'], cw, [
            ['Rating Promedio', `${data.stats.ratingAverage} / 5.0`],
            ['Tickets Resueltos', data.stats.ticketsResolved],
            ['Tiempo Promedio de Resolución', `${data.stats.averageTime}h`],
            ['Técnicos Activos', data.stats.activeTechnicians],
        ]);
    }

    // ── Rankings ──
    if (selected.rankings) {
        heading('Ranking de Técnicos');
        const cw = [45, 45, 20, 25, 25, 22]; // Total 182 approx for A4
        table(['Nombre', 'Departamento', 'Rating', 'Tickets', 'T. Prom', 'Estado'], cw,
            data.rankings.map((t) => [
                t.name, t.department, t.rating.toFixed(1), t.tickets_resolved, `${t.average_time}h`, t.status
            ])
        );
    }

    // ── Tendencia ──
    if (selected.tendencia) {
        heading('Tendencia Mensual');
        const cw = [(W - M * 2) / 3, (W - M * 2) / 3, (W - M * 2) / 3];
        table(['Mes', 'Año', 'Rating'], cw,
            data.monthlyTrend.map((m) => [m.month || m.month_name, m.year, m.rating.toFixed(2)])
        );
    }

    // ── Distribución ──
    if (selected.distribucion) {
        heading('Distribución de Estrellas');
        const cw = [(W - M * 2) * 0.7, (W - M * 2) * 0.3];
        table(['Calificación', 'Total Votos'], cw,
            data.distribution.map((d) => [`${d.score} Estrellas`, d.total || d.count])
        );
    }

    // ── Departamentos ──
    if (selected.departamentos) {
        heading('Desempeño por Departamento');
        const cw = [(W - M * 2) * 0.4, (W - M * 2) * 0.2, (W - M * 2) * 0.2, (W - M * 2) * 0.2];
        table(['Departamento', 'Rating', 'Tickets', 'Satisfacción'], cw,
            data.departmentPerformance.map((d) => [
                d.name, 
                (parseFloat(d.average_rating || d.rating)).toFixed(2), 
                d.total_tickets || d.tickets, 
                `${d.satisfaction_pct || d.satisfaction}%`
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

    doc.save(`Reporte_Rating_Tecnicos_${new Date().toISOString().slice(0,10)}.pdf`);
}

export default function RatingExportModal({ open, onClose, data }) {
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
                await doExportExcel({ selected, data });
            } else {
                await doExportPDF({ selected, data });
            }
            onClose();
        } catch (e) {
            console.error(e);
            setError('Error al exportar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-sidebar-border bg-white shadow-xl dark:bg-zinc-900">

                <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
                    <h2 className="text-base font-medium text-gray-900 dark:text-white">Exportar Reporte de Ratings</h2>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-zinc-800">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Formato</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: 'pdf',   Icon: FileText,        label: 'PDF',   desc: 'Documento formal'     },
                                { key: 'excel', Icon: FileSpreadsheet, label: 'Excel', desc: 'Datos crudos'          },
                            ].map(({ key, Icon, label, desc }) => (
                                <button
                                    key={key}
                                    onClick={() => setFormat(key)}
                                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                        format === key
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-sidebar-border hover:bg-gray-50 dark:hover:bg-zinc-800'
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
                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${i !== 0 ? 'border-t border-sidebar-border' : ''}`}
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

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-sidebar-border px-5 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400"
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
