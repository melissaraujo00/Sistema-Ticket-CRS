import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) return null;

    const translateLabel = (label) => {
        return label
            .replace('Previous', 'Anterior')
            .replace('Next', 'Siguiente');
    };

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="px-4 py-2 text-sm text-zinc-400 border border-zinc-200 rounded-md dark:border-zinc-800"
                        dangerouslySetInnerHTML={{ __html: translateLabel(link.label) }}
                    />
                ) : (
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                            link.active
                                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900'
                        }`}
                        dangerouslySetInnerHTML={{ __html: translateLabel(link.label) }}
                    />
                )
            ))}
        </div>
    );
}
