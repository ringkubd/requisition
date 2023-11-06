<?php

namespace App\Providers;

use App\Dbal\ProductStatus;
use App\Support\CreateUpdateOrDelete;
use Doctrine\DBAL\Types\Type;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
//        Type::addType('product_enum_type', ProductStatus::class);
        if (!$this->app->isLocal()) {
            //else register your services you require for production
            $this->app['request']->server->set('HTTPS', true);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if(!env('APP_DEBUG')){
            URL::forceScheme('https');
        }
        \DB::getDoctrineSchemaManager()->getDatabasePlatform()->registerDoctrineTypeMapping('geography', 'string');
        \DB::getDoctrineSchemaManager()->getDatabasePlatform()->registerDoctrineTypeMapping('geometry', 'string');

        HasMany::macro('createUpdateOrDelete', function (iterable $records){
            $hasMany = $this;
            return (new CreateUpdateOrDelete($hasMany, $records))();
        });
    }
}
