<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\Department;
use App\Models\User;
use App\Models\Status;
use App\Models\Priority;
use App\Models\HelpTopic;
use App\Models\SlaPlan;
use App\Models\Ticket;
use App\Models\Division;
use App\Models\Knowledge;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class TecnicoDataSeeder extends Seeder
{
    public function run(): void
    {

        $deptSoporte = Department::where('name', 'Soporte Técnico')->first();
        $deptSistemas = Department::where('name', 'Desarrollo de Sistemas')->first();
        $adminSoporte = User::where('email', 'admin.soporte@empresa.com')->first();

        $tecnico1 = User::where('email', 'tecnico1@empresa.com')->first();
        $usuario1 = User::where('email', 'juan.perez@empresa.com')->first();
        $usuario2 = User::where('email', 'ana.martinez@empresa.com')->first();



        // Crear estados de tickets
        $estadoAbierto   = Status::where('name', 'Abierto')->firstOrFail();
        $estadoEnProceso = Status::where('name', 'En Proceso')->firstOrFail();
        $estadoResuelto  = Status::where('name', 'Resuelto')->firstOrFail();
        $estadoCerrado   = Status::where('name', 'Cerrado')->firstOrFail();

        // Crear prioridades
        $prioridadBaja = Priority::firstOrCreate(['name' => 'Baja', 'color' => '#28a745', 'level' => 1]);
        $prioridadMedia = Priority::firstOrCreate(['name' => 'Media', 'color' => '#ffc107', 'level' => 2]);
        $prioridadAlta = Priority::firstOrCreate(['name' => 'Alta', 'color' => '#fd7e14', 'level' => 3]);
        $prioridadCritica = Priority::firstOrCreate(['name' => 'Crítica', 'color' => '#dc3545', 'level' => 4]);

        // Crear planes SLA
        $slaBasico = SlaPlan::firstOrCreate(['name' => 'Básico', 'grace_time_hours' => 48, 'working_hours' => 9]);
        $slaPremium = SlaPlan::firstOrCreate(['name' => 'Premium', 'grace_time_hours' => 24, 'working_hours' => 7]);

        // --- INICIO DE LA REFACTORIZACIÓN ---

        // 1. BUSCAR categorías existentes (Creadas por CategorySeeder)
        $categoriaHardware = Category::where('name', 'Hardware')->first();
        $categoriaSoftware = Category::where('name', 'Software')->first();
        $categoriaRed = Category::where('name', 'Redes y conectividad')->first(); // Nombre ajustado

        // 2. BUSCAR artículos de Knowledge Base existentes (Creados por KnowledgeSeeder)
        // Tomamos el primer artículo que corresponda a cada categoría
        $knowledgeHardware = Knowledge::where('category_id', $categoriaHardware->id)->first();
        $knowledgeSoftware = Knowledge::where('category_id', $categoriaSoftware->id)->first();
        $knowledgeRed = Knowledge::where('category_id', $categoriaRed->id)->first();

        // --- FIN DE LA REFACTORIZACIÓN ---

        // Crear divisiones
// Divisiones y Temas de Ayuda
        $divisionHardware = Division::firstOrCreate(['name' => 'Soporte Hardware', 'characteristics' => 'Físico', 'department_id' => $deptSoporte->id]);
        $divisionSoftware = Division::firstOrCreate(['name' => 'Soporte Software', 'characteristics' => 'Apps', 'department_id' => $deptSistemas->id]);
        $divisionRed = Division::firstOrCreate(['name' => 'Soporte Red', 'characteristics' => 'Redes', 'department_id' => $deptSoporte->id]);

        // Crear temas de ayuda (Vinculando lo que encontramos)
        $temaHardware = HelpTopic::firstOrCreate(['name_topic' => 'Hardware', 'division_id' => $divisionHardware->id, 'priority_id' => $prioridadMedia->id, 'sla_plan_id' => $slaBasico->id, 'knowledge_id' => $knowledgeHardware->id]);
        $temaSoftware = HelpTopic::firstOrCreate(['name_topic' => 'Software', 'division_id' => $divisionSoftware->id, 'priority_id' => $prioridadAlta->id, 'sla_plan_id' => $slaPremium->id, 'knowledge_id' => $knowledgeSoftware->id]);
        $temaRed = HelpTopic::firstOrCreate(['name_topic' => 'Red', 'division_id' => $divisionRed->id, 'priority_id' => $prioridadCritica->id, 'sla_plan_id' => $slaPremium->id, 'knowledge_id' => $knowledgeRed->id]);

        // Crear tickets de ejemplo
        $tickets = [
            [
                'code' => 'TK-001',
                'subject' => 'Impresora no funciona',
                'message' => 'La impresora HP del departamento no responde...',
                'email' => 'juan.perez@empresa.com',
                'requesting_user' => $usuario1->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaHardware->id,
                'priority_id' => $prioridadMedia->id,
                'sla_plan_id' => $slaBasico->id,
                'department_id' => $deptSoporte->id,
                'status_id' => $estadoEnProceso->id,
                'creation_date' => Carbon::now()->subDays(2),
                'expiration_date' => Carbon::now()->addDays(1),
                'closing_date' => Carbon::now()->addMonth(),
            ],
            [
                'code' => 'TK-002',
                'subject' => 'No puedo acceder al sistema',
                'message' => 'Al intentar ingresar al sistema de gestión, me aparece un error de credenciales incorrectas.',
                'email' => 'ana.martinez@empresa.com',
                'requesting_user' => $usuario2->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaSoftware->id,
                'priority_id' => $prioridadAlta->id,
                'sla_plan_id' => $slaPremium->id,
                'department_id' => $deptSistemas->id,
                'status_id' => $estadoResuelto->id,
                'creation_date' => Carbon::now()->subDays(5),
                'expiration_date' => Carbon::now()->subDays(3),
                'closing_date' => Carbon::now()->subDays(2),
            ],
            [
                'code' => 'TK-003',
                'subject' => 'Internet muy lento',
                'message' => 'La conexión a internet en toda el área de sistemas está extremadamente lenta, afectando nuestra productividad.',
                'email' => 'juan.perez@empresa.com',
                'requesting_user' => $usuario1->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaRed->id,
                'priority_id' => $prioridadCritica->id,
                'sla_plan_id' => $slaPremium->id,
                'department_id' => $deptSoporte->id,
                'status_id' => $estadoAbierto->id,
                'creation_date' => Carbon::now()->subHours(6),
                'expiration_date' => Carbon::now()->addHours(18),
                'closing_date' => Carbon::now()->addMonth(),
            ],
            [
                'code' => 'TK-004',
                'subject' => 'Monitor parpadea',
                'message' => 'El monitor de mi escritorio comienza a parpadear intermitentemente, causando dolor de cabeza.',
                'email' => 'ana.martinez@empresa.com',
                'requesting_user' => $usuario2->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaHardware->id,
                'priority_id' => $prioridadBaja->id,
                'sla_plan_id' => $slaBasico->id,
                'department_id' => $deptSoporte->id,
                'status_id' => $estadoCerrado->id,
                'creation_date' => Carbon::now()->subWeek(),
                'expiration_date' => Carbon::now()->subDays(4),
                'closing_date' => Carbon::now()->subDays(3),
            ],
            [
                'code' => 'TK-005',
                'subject' => 'Error en base de datos',
                'message' => 'El sistema muestra errores de conexión a la base de datos cuando intento generar reportes.',
                'email' => 'juan.perez@empresa.com',
                'requesting_user' => $usuario1->id,
                'assigned_user' => $tecnico1->id,
                'help_topic_id' => $temaSoftware->id,
                'priority_id' => $prioridadAlta->id,
                'sla_plan_id' => $slaPremium->id,
                'department_id' => $deptSistemas->id,
                'status_id' => $estadoEnProceso->id,
                'creation_date' => Carbon::now()->subDay(),
                'expiration_date' => Carbon::now()->addDay(),
                'closing_date' => Carbon::now()->addMonth(),
            ],
        ];

        foreach ($tickets as $ticketData) {
            Ticket::firstOrCreate(['code' => $ticketData['code']], $ticketData);
        }
    }
}
