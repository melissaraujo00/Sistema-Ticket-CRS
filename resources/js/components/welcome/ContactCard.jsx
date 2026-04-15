import React from 'react';

export default function ContactCard({ icon, title, desc, sub }) {
    return (
        <div className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl transition-all hover:-translate-y-1">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 transition-colors group-hover:bg-red-50">
                {React.cloneElement(icon, { className: 'h-6 w-6' })}
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</h3>
            <p className="my-1 text-sm font-bold text-gray-900">{desc}</p>
            <p className="text-[11px] font-medium text-gray-400">{sub}</p>
        </div>
    );
}
