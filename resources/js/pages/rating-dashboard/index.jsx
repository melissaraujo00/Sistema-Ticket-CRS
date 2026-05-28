import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Star,
    CheckCircle,
    Clock,
    Users,
    TrendingUp,
    Award,
    BarChart3,
    Calendar,
    AlertCircle,
    FileText
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import RatingExportModal from '@/components/rating-dashboard/RatingExportModal';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rating de Técnicos', href: '/ratings-dashboard' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MONTHS = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
];

function KpiCard({ icon: Icon, title, value, description, colorClass }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="text-2xl font-bold">{value}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RatingDashboard({
    stats,
    technicianRankings = [],
    monthlyTrend = [],
    distribution = [],
    departmentPerformance = [],
    currentPeriod = { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    error
}) {
    const [exportOpen, setExportOpen] = useState(false);

    // Opciones de años (del actual hacia atrás 2 años)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    }, []);

    const handlePeriodChange = (month, year) => {
        const m = month ? parseInt(month) : currentPeriod.month;
        const y = year ? parseInt(year) : currentPeriod.year;

        router.get(route('ratings.dashboard'), { 
            month: m, 
            year: y 
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Normalizar rankings
    const rankings = (technicianRankings || []).map(t => ({
        ...t,
        rating: parseFloat(t.rating ?? 0),
    }));

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Rating Dashboard" />
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
                    <h2 className="text-xl font-semibold">{error}</h2>
                    <p className="text-muted-foreground text-center">
                        Las estadísticas se generan periódicamente.
                    </p>
                </div>
            </AppLayout>
        );
    }

    // Preparar datos para distribución
    const distributionData = (Array.isArray(distribution) ? distribution : [])
        .map(item => ({
            name: `${item.score} ★`,
            value: Number(item.total ?? item.count ?? 0)
        }))
        .sort((a, b) => b.name.localeCompare(a.name));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rating de Técnicos" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Rating de Técnicos</h1>
                        <p className="text-muted-foreground">
                            Análisis de desempeño y satisfacción del servicio técnico.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border shadow-sm h-10">
                            <Select 
                                value={currentPeriod.month.toString()} 
                                onValueChange={(val) => handlePeriodChange(val, null)}
                            >
                                <SelectTrigger className="w-[130px] border-none shadow-none focus:ring-0 h-8">
                                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="Mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={m.value.toString()}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="w-px h-4 bg-border" />

                            <Select 
                                value={currentPeriod.year.toString()} 
                                onValueChange={(val) => handlePeriodChange(null, val)}
                            >
                                <SelectTrigger className="w-[100px] border-none shadow-none focus:ring-0 h-8">
                                    <SelectValue placeholder="Año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={() => setExportOpen(true)}
                            variant="outline"
                            className="flex items-center gap-2 h-10 px-4"
                        >
                            <FileText size={16} />
                            Descargar Reporte
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        icon={Star}
                        title="Rating Promedio"
                        value={`${stats?.ratingAverage?.toFixed(1) || 0} / 5.0`}
                        description={`Periodo: ${MONTHS.find(m => m.value === currentPeriod.month)?.label} ${currentPeriod.year}`}
                        colorClass="bg-yellow-500"
                    />
                    <KpiCard
                        icon={CheckCircle}
                        title="Tickets Resueltos"
                        value={stats?.ticketsResolved || 0}
                        description="En el mes seleccionado"
                        colorClass="bg-green-500"
                    />
                    <KpiCard
                        icon={Clock}
                        title="Tiempo Promedio"
                        value={`${stats?.averageTime || 0}h`}
                        description="Cierres del periodo"
                        colorClass="bg-blue-500"
                    />
                    <KpiCard
                        icon={Users}
                        title="Técnicos Activos"
                        value={stats?.activeTechnicians || 0}
                        description="Global"
                        colorClass="bg-purple-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tendencia Mensual */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Tendencia de Calificación
                                </CardTitle>
                                <CardDescription>Evolución de los últimos 6 meses registrados</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyTrend}>
                                        <defs>
                                            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 12}} 
                                        />
                                        <YAxis
                                            domain={[0, 5]}
                                            ticks={[0, 1, 2, 3, 4, 5]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{fontSize: 12}}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`${value} ★`, 'Rating']}
                                            labelFormatter={(label, payload) => {
                                                if (payload && payload.length > 0) {
                                                    return `${payload[0].payload.month} ${payload[0].payload.year}`;
                                                }
                                                return label;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="rating"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRating)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribución de Ratings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-orange-500" />
                                Distribución
                            </CardTitle>
                            <CardDescription>Estrellas en {MONTHS.find(m => m.value === currentPeriod.month)?.label}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ranking de Técnicos */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    Top Técnicos
                                </CardTitle>
                                <CardDescription>Rendimiento en el periodo seleccionado</CardDescription>
                            </div>
                            <Badge variant="outline" className="font-normal">
                                {MONTHS.find(m => m.value === currentPeriod.month)?.label}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {rankings.map((tech, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 text-sm font-bold text-muted-foreground">
                                                #{index + 1}
                                            </div>
                                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{tech.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{tech.tickets_resolved} tickets · {tech.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-bold">{parseFloat(tech.rating).toFixed(1)}</span>
                                            </div>
                                            <Badge variant={index === 0 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                                                {tech.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {rankings.length === 0 && (
                                    <p className="text-center py-4 text-muted-foreground">No hay actividad registrada en este periodo.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Desempeño por Departamento */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                Desempeño por Departamento
                            </CardTitle>
                            <CardDescription>Resultados del periodo seleccionado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentPerformance} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                        <XAxis type="number" domain={[0, 5]} hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{fontSize: 12}}
                                            width={100}
                                        />
                                        <Tooltip
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="average_rating"
                                            fill="#8b5cf6"
                                            radius={[0, 4, 4, 0]}
                                            barSize={20}
                                            name="Rating Promedio"
                                        >
                                            {departmentPerformance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <RatingExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                data={{
                    stats,
                    rankings,
                    monthlyTrend,
                    distribution,
                    departmentPerformance
                }}
            />
        </AppLayout>
    );
}

