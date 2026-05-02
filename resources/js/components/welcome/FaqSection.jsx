import React, { useState } from 'react';
import { LifeBuoy, BookOpen, ChevronDown } from 'lucide-react';

export default function FaqSection({ knowledges }) {
    const categoriasUnicas = Array.from(
        new Set(knowledges.map((item) => item.category.name))
    );
    const [expandedCategory, setExpandedCategory] = useState(categoriasUnicas[0] || null);

    const toggleCategory = (categoria) => {
        setExpandedCategory(expandedCategory === categoria ? null : categoria);
    };

    return (
        <section className="pb-24 pt-12">
            <div className="mx-auto max-w-4xl px-6">
                <div className="mb-12 flex flex-col items-center text-center">
                    <LifeBuoy className="mb-4 h-12 w-12 text-[#DA291C]" />
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">PREGUNTAS FRECUENTES</h2>
                    <div className="mt-2 h-1 w-20 bg-[#DA291C]"></div>
                </div>

                <div className="flex flex-col gap-4">
                    {categoriasUnicas.map((categoria) => (
                        <div
                            key={categoria}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all"
                        >
                            <button
                                onClick={() => toggleCategory(categoria)}
                                className={`flex w-full items-center justify-between p-5 text-left transition-colors ${
                                    expandedCategory === categoria
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className={`h-5 w-5 ${expandedCategory === categoria ? 'text-[#DA291C]' : 'text-gray-400'}`} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">{categoria}</h3>
                                </div>
                                <div className={`transition-transform duration-300 ${
                                    expandedCategory === categoria ? 'rotate-180 text-white' : 'text-gray-400'
                                }`}>
                                    <ChevronDown className="h-5 w-5" />
                                </div>
                            </button>

                            <div className={`transition-all duration-500 ease-in-out ${
                                expandedCategory === categoria ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="p-6 sm:p-8 bg-gray-50/50">
                                    <div className="border-l-2 border-gray-200 ml-2 sm:ml-4 space-y-8 py-2">
                                        {knowledges
                                            .filter((item) => item.category.name === categoria)
                                            .map((faq) => (
                                                <div key={faq.id} className="relative pl-6 sm:pl-8">
                                                    <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#DA291C] ring-4 ring-white/50"></div>
                                                    <h4 className="text-[15px] font-bold text-gray-900 mb-2">{faq.title}</h4>
                                                    <p className="text-[14px] leading-relaxed text-gray-600 font-medium">
                                                        {faq.content_response}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
