<?php

use App\Models\Department;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ticket_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Ticket::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(User::class)->constrained();
            $table->foreignIdFor(Department::class)->constrained();
            $table->text('advances')->comment('Lo que se intentó hacer');
            $table->text('justification')->comment('Por qué no se pudo resolver');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_incidents');
    }
};
