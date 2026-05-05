import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; 

export function GenericTable({ data = [], columns = [], rowsPerPage = 25 }) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = data.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow>
                            {columns.map((col, i) => (
                                <TableHead 
                                    key={i} 
                                    className={`text-center px-6 font-bold text-zinc-700 dark:text-zinc-300 ${col.className || ""}`}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length > 0 ? (
                            currentData.map((item, i) => (
                                <TableRow key={i} className="hover:bg-zinc-50/50 transition-colors">
                                    {columns.map((col, j) => (
                                        <TableCell 
                                            key={j} 
                                            className={`px-6 py-4 ${col.className || ""}`}
                                        >
                                            <div className="flex justify-center items-center">
                                                {col.render(item)}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell 
                                    colSpan={columns.length} 
                                    className="h-24 text-center text-zinc-500"
                                >
                                    No hay registros.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Controles de Paginación */}
            {data.length > rowsPerPage && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-zinc-500">
                        Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}