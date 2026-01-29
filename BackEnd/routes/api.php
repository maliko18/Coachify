<?php

use App\Http\Resources\UserResources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return new UserResources($request->user()->load('roles', 'coach'));
});


require __DIR__.'/auth.php';