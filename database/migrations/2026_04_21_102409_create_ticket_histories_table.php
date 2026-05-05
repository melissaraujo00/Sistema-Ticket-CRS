<?php

use App\Models\Department;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ticket_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Ticket::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->string('action_type');
            $table->foreignIdFor(User::class, 'assigned_user')->nullable()->constrained('users');
            $table->text('internal_note')->nullable();
            $table->foreignIdFor(Department::class, 'previous_department')->nullable()->constrained('departments');
            $table->foreignIdFor(Department::class, 'new_department')->nullable()->constrained('departments');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_histories');
    }
};
