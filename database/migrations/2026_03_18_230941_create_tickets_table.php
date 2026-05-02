<?php

use App\Models\Department;
use App\Models\HelpTopic;
use App\Models\Priority;
use App\Models\SlaPlan;
use App\Models\Status;
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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('code',40);
            $table->date('creation_date');
            $table->string('email', 100);
            $table->string('subject', 200);
            $table->text('message');
            $table->date('expiration_date')->nullable();
            $table->date('closing_date')->nullable();
            $table->foreignIdFor(User::class, 'requesting_user')->constrained();
            $table->foreignIdFor(User::class, 'assigned_user')->nullable()->constrained();
            $table->foreignIdFor(HelpTopic::class)->constrained();
            $table->foreignIdFor(Priority::class)->nullable()->constrained();
            $table->foreignIdFor(SlaPlan::class)->nullable()->constrained();
            $table->foreignIdFor(Department::class)->constrained();
            $table->foreignIdFor(Status::class)->constrained();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
