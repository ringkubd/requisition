<?php

namespace App\Providers;

use App\Dbal\ProductStatus;
use Doctrine\DBAL\Types\Type;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
//        Type::addType('product_enum_type', ProductStatus::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
