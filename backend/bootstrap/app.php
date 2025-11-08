<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        api: __DIR__.'/../routes/api.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // This replaces your global $middleware array
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
            // ... add your other global middleware here
        ]);

        // This replaces $middlewareGroups['web']
        $middleware->web(append: [
            // ... add your custom 'web' middleware here
        ]);

        // This replaces $middlewareGroups['api']
        $middleware->api(append: [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            // ... add your other 'api' middleware here
        ]);
        
        // This is where $routeMiddleware aliases would go
        $middleware->alias([
            // 'auth' => \App\Http\Middleware\Authenticate::class,
            // 'isAdmin' => \App\Http\Middleware\IsAdmin::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
