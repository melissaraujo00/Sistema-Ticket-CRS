<?php

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
        Schema::create('ticket_solutions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Ticket::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->text('message');
            $table->date('date');
            $table->text('attach');
            $table->string('type')->default('public_reply');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_solutions');
    }
};
