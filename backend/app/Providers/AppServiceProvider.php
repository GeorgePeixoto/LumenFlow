<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(FirebaseService::class, function () {
            return new FirebaseService();
        });

        $this->app->bind(WokwiService::class, function () {
            return new WokwiService(app(FirebaseService::class));
        });

        $this->app->bind(FirebaseAuthService::class, function () {
            return new FirebaseAuthService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
