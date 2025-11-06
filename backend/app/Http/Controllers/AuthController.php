<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /*
        Register a new user
    */

    public function register(Request $request) 
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'name' => 'requried|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'location' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'location' => $request->location,
            'notification_preferences' => json_encode([
                'email' => true,
                'push' => true,
                'sms' => false,
                'severity_levels' => ['high', 'critical']
            ]),
        ]);

        // Create auth token
        $token = $user->createToken('aegies-auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], Response::HTTP_CREATED);
    }

    /*
        Login user and create token
    */
    public function login(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Attempt authentication
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = User::where('email', $request->email)->firstorFail();
        $token = $user->createToken('aegis-auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /*
        Logout user (revoke token)
    */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'messsage' => 'Successfully logged out'
        ]);
    }

    /* 
        Get authenticated user profile
    */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
