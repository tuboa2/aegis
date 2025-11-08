<?php 

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/health', function() {
  return response()->json([
    'status' => 'success',
    'message' => 'Aegis API is running',
    'timestamp' => now()->toISOString(),
    'version' => '1.0.0'
  ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function() {
  // Auth routes
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::get('/user', [AuthController::class, 'user']);

  // User profile routes
  Route::prefix('/profile')->group(function () {
    Route::put('/', [UserController::class, 'updateProfile']);
    Route::post('/change-password', [UserController::class, 'changePassword']);
  });

  // Disater alerts (to be implemented later)
  Route::prefix('/alerts')->group(function () {
    Route::get('/', function () {
      return response()->json(['message' => 'Alerts endpoint']);
    });
  });
});
