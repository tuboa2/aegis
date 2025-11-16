<?php 

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DisasterAlertController;
use App\Http\Controllers\AIController;
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
    Route::get('/', [DisasterAlertController::class, 'index']);
    Route::get('/statistics', [DisasterAlertController::class, 'statistics']);
    Route::post('/', [DisasterAlertController::class, 'store']);
    Route::get('/alert', [DisasterAlertController::class, 'show']);
    Route::post('/sync-external', [DisasterAlertController::class, 'syncExternalData']);
  });

  // AI Routes
  Route::prefix('/ai')->group(function () {
    Route::get('/summary/alert/{alert}', [AIController::class, 'generateSummary']);
    Route::post('/summary/alert/{alert}/regenerate', [AIController::class, 'regenerateSummary']);
    Route::get('/predictive-insights', [AIController::class, 'predictiveInsights']);
    Route::post('/query', [AIController::class, 'processQuery']);
    Route::get('/stats', [AIController::class, 'analysisStats']);
  });
  
});
