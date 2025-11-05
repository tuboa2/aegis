<?php 

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function() {
  return response()->json([
    'status' => 'success',
    'message' => 'Aegis API is running',
    'timestamp' => now()->toISOString(),
    'version' => '1.0.0'
  ]);
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function() {
  Route::get('/user', function (Request $request) {
    return $request->user();
  });
});
