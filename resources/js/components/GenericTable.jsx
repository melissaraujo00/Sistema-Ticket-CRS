import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * 
 * @param {Array} 
 * @param {Array} 
 */

export function GenericTable({ data = [], columns = [] }) {
    return (
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
                    {data.length > 0 ? (
                        data.map((item, i) => (
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
    );
}