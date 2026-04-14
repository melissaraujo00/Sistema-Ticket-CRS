<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Knowledge;
use Illuminate\Database\Seeder;

class KnowledgeSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'Accesos y credenciales' => [
                [
                    'title' => '¿Cómo restablecer mi contraseña institucional?',
                    'content' => 'Para restablecer su contraseña, haga clic en "¿Olvidó su contraseña?" en la pantalla de inicio o contacte a la extensión 1500 si su cuenta está bloqueada.'
                ],
                [
                    'title' => 'Primer acceso al sistema de tickets',
                    'content' => 'Debe utilizar su correo institucional (@cruzroja.org.sv). La contraseña inicial es proporcionada por el departamento de TI al momento de su contratación.'
                ]
            ],
            'Hardware' => [
                [
                    'title' => 'Reporte de fallas en equipo de cómputo',
                    'content' => 'Si su computadora no enciende o presenta ruidos inusuales, cree un ticket de prioridad ALTA detallando el número de inventario del equipo.'
                ],
                [
                    'title' => 'Solicitud de periféricos (Mouse/Teclado)',
                    'content' => 'Para solicitar el cambio de periféricos dañados, es necesario entregar el componente defectuoso al técnico asignado para su debida reposición.'
                ]
            ],
            'Software' => [
                [
                    'title' => 'Instalación de programas autorizados',
                    'content' => 'Toda instalación de software debe ser realizada por el equipo de TI. No se permite la instalación de software sin licencia o de uso personal.'
                ]
            ],
            'Redes y conectividad' => [
                [
                    'title' => 'Problemas con la conexión Wi-Fi',
                    'content' => 'Si experimenta lentitud, asegúrese de estar conectado a la red "CR-Institucional". Si el problema persiste, reinicie el adaptador de red de su equipo.'
                ],
                [
                    'title' => 'Uso de la VPN para trabajo remoto',
                    'content' => 'La VPN solo está autorizada para personal administrativo con equipo institucional asignado. Requiere autenticación de dos pasos.'
                ]
            ],
            'Correo y comunicación' => [
                [
                    'title' => 'Configuración de Outlook',
                    'content' => 'Para configurar su correo en un nuevo dispositivo, utilice la opción de cuenta "Exchange" e ingrese sus credenciales institucionales.'
                ]
            ],
            'Sistemas internos' => [
                [
                    'title' => 'Error al cargar reporte de actividades',
                    'content' => 'Si el sistema muestra un error de "Timeout", verifique su conexión a internet o intente limpiar la caché del navegador (Ctrl + F5).'
                ]
            ],
            'Seguridad' => [
                [
                    'title' => 'Reporte de correos sospechosos (Phishing)',
                    'content' => 'Si recibe un correo pidiendo sus credenciales, no haga clic en ningún enlace y repórtelo inmediatamente como "Incidente de Seguridad".'
                ]
            ],
            'Mantenimiento' => [
                [
                    'title' => 'Mantenimiento preventivo trimestral',
                    'content' => 'El departamento de TI programa limpiezas físicas y optimización de software cada 3 meses. Se le notificará vía correo la fecha programada.'
                ]
            ],
        ];

        foreach ($data as $categoryName => $knowledges) {
            $category = Category::where('name', $categoryName)->first();

            if ($category) {
                foreach ($knowledges as $item) {
                    Knowledge::create([
                        'title' => $item['title'],
                        'content_response' => $item['content'],
                        'creation_date' => now(),
                        'category_id' => $category->id,
                    ]);
                }
            }
        }

        $remainingCategories = Category::whereNotIn('name', array_keys($data))->get();

        foreach ($remainingCategories as $category) {
            Knowledge::create([
                'title' => 'Guía de procedimientos: ' . $category->name,
                'content_response' => 'Para consultas sobre ' . $category->name . ', por favor contacte a su supervisor o revise el manual de procesos administrativos disponible.',
                'creation_date' => now(),
                'category_id' => $category->id,
            ]);
        }
    }
}
