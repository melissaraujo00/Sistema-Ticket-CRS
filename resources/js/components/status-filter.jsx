export default function StatusFilter({ value, onChange, statuses }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none"
        >
            <option value="Todos los estados">Todos los estados</option>
            {statuses.map((status) => (
                <option key={status} value={status}>
                    {status}
                </option>
            ))}
        </select>
    );
}