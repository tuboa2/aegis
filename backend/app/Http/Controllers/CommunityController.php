<?php

namespace App\Http\Controllers;

use App\Models\UserReport;
use App\Models\ReportComment;
use App\Models\ReportUpvote;
use App\Models\SafetyTip;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    // Get all public reports with filters
    public function getReports(Request $request)
    {
        $query = UserReport::with(['user', 'alert', 'verifiedBy'])
            ->withCount(['comments', 'upvotes'])
            ->public()
            ->orderBy('created_at', 'desc');
        
        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->type($request->type);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity !== 'all') {
            $query->where('severity', $request->severity);
        }

        // Filter by location
        if ($request->has(['latitude', 'longitude'])) {
            $radius = $request->get('radius', 50); // Default 50km radius
            $query->nearby($request->latitude, $request->longitude, $radius);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('location_name', 'like', '%' . $request->search . '%');
            });
        }

        $reports = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'last_page' => $reports->lastPage(),
            ]
        ]);
    }

    // Create a new user report
    public function createReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:earthquake,flood,storm,wildfire,volcanic,tsunami,other',
            'severity' => 'required|in:low,medium,high,critical',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numberic|between:-180,180',
            'location_name' => 'nullable|string|max:255',
            'contact_info' => 'nullable|string|max:500',
            'media' => 'nullable|array|max:5',
            'media.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max per file
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Handle media uploads
        $mediaUrls = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('reports/' . date('Y/m'), 'public');
                $mediaUrls[] = Storage::url($path);
            }
        }

        $report = UserReport::class([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'contact_info' => $request->contact_info,
            'media_urls' =>  $mediaUrls,
            'is_public' => $request->get('is_public', true),
            'status' => UserReport::STATUS_PENDING,
        ]);

        // Associate with nearby alert if exists
        $nearByAlert = $this->findNearbyAlert($request->latitude, $request->longitude);
        if ($nearByAlert) {
            $report->update(['alert_id' => $nearByAlert->id]);
        }

        $report->load(['user', 'alert']);

        return response()->json($report, Response::HTTP_CREATED);
    }

    // Find nearby alert for report association
    private function findNearbyAlert($latitude, $longitude)
    {
        return \App\Models\DisasterAlert::active()
            ->whereRaw("
                (6371 * ACOS(
                    COS(RADIANS(?)) *
                    COS(RADIANS(latitude)) *
                    COS(RADIANS(longitude) - RADIANS(?)) +
                    SIN(RADIANS(?) * SIN(RADIANS(latitude)))
                )) < radius_km
            ", [$latitude, $longitude, $latitude])
            ->orderBy('started_by', 'desc')
            ->first();
    }

    // Get a specific report with details
    public function getReport(UserReport $report)
    {
        // Only allow viewing public reports or user's own reports
        if (!$report->is_public && Auth::id() !== $report->user_id) { 
            return response()->json([
                'message' => 'Report not found or not accessible'
            ], Response::HTTP_NOT_FOUND);
        }

        $report->load([
            'user',
            'alert',
            'verifiedBy',
            'comments.user',
            'upvotes.user'
        ]);
        $report->loadCount(['comments', 'upvotes']);

        // Check if current user has upvoted
        $report->user_has_upvoted = $report->upvotes()
            ->where('user_id', Auth::id())
            ->exists();

        return response()->json($report);
    }

    // Add comment to a report
    public function addComment(Request $request, UserReport $report)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $comment = ReportComment::create([
            'user_id' => $request->user()->id,
            'report_id' => $report->id,
            'content' => $request->get('column'),
        ]);

        // Update report comments count
        UserReport::where('id', $report->id)->increment('comments_count');

        $comment->load('user');

        return response()->json($comment, Response::HTTP_CREATED);
    }

    // Upvote a report
    public function upvoteReport(Request $request, UserReport $report)
    {
        $existingUpvote = ReportUpvote::where('user_id', $request->user()->id)
            ->where('report_id', $report->id)
            ->first();
        
        if ($existingUpvote) {
            // Remove upvote
            $existingUpvote->delete();
            UserReport::where('id', $report->id)->decrement('upvotes_count');
            $upvoted = false;
        } else {
            // Add upvote
            ReportUpvote::create([
                'user_id' => $request->user()->id,
                'report_id' => $report->id,
            ]);
            UserReport::where('id', $report->id)->increment('upvotes_count');
            $upvoted = true;
        }

        return response()->json([
            'upvoted' => $upvoted,
            'upvotes_count' => $report->upvotes_count,
        ]);
    }

    // Get safety tips
    public function getSafetyTips(Request $request)
    {
        $query = SafetyTip::active()->orderBy('order')->orderBy('created_at', 'desc');
        
        // Filter by disaster type
        if ($request->has('type') && $request->type !== 'all') {
            $query->type($request->type);
        }

        // Filter by severity level
        if ($request->has('severity') && $request->severity !== 'all') {
            $query->severity($request->severity);
        }

        $tips = $query->get();

        return response()->json($tips);
    }

    // Get emergency contacts and resources
    public function getEmergencyResources()
    {
        $resources = [
            'emergency_contacts' => [
                [
                    'name' => 'National Emergency Hotline',
                    'number' => '911',
                    'description' => 'General emergency services',
                    'type' => 'phone'
                ],
                [
                    'name' => 'Philippine Red Cross',
                    'number' => '143',
                    'description' => 'Disaster response and relief',
                    'type' => 'phone'
                ],
                [
                    'name' => "NDRRMC Hotline",
                    'number' => '911-5061',
                    'description' => 'National Disaster Risk Reduction and Management Council',
                    'type' => 'phone'
                ],
                [
                    'name' => 'PHIVOLCS',
                    'number' => '+63 2 8426 1468',
                    'description' => 'Earthquake and volcano monitoring',
                    'type' => 'phone'
                ]
            ],
            'important_websites' => [
                [
                    'name' => 'NDRRMC Website',
                    'url' => 'https://ndrrmc.gov.ph',
                    'description' => 'Official disaster management agency'
                ],
                [
                    'name' => 'PAGASA Weather',
                    'url' => 'https://pagasa.dost.gov.ph',
                    'description' => 'Weather forecasts and typhoon updates'
                ],
                [
                    'name' => 'PHIVOLCS Earthquake',
                    'url' => 'https://earthquake.phivolcs.dost.gov.ph',
                    'description' => 'Real-time earthquake information'
                ]
            ],
            'preparedness_guides' => [
               [
                    'title' => 'Earthquake Preparedness Guid',
                    'type' => 'earthquake',
                    'steps' => [
                        'Identify safe spots in each room',
                        'Prepare emergency supply kit',
                        'Practice drop, cover, and hold on',
                        'Secure heavy furniture' 
                    ]
                ],
                [
                    'title' => 'Flood Safety Guide',
                    'type' => 'flood',
                    'steps' => [
                        'Move to higher ground immediately',
                        'Avoid walking through moving water',
                        'Do not drive in flooded areas',
                        'Stay informed about water levels'
                    ]
                ]
            ]
        ];

        return response()->json($resources);
    }

    // Share report on social media
    public function shareReport(UserReport $report)
    {
        // Increment share count 
        UserReport::where('id', $report->id)->increment('share_count');

        $shareData = [
            'title' => $report->title,
            'description' => Str::limit($report->description, 100),
            'url' => config('app.frontend_url') . '/reports/' . $report->id,
            'image' => $report->media_urls[0] ?? null,
        ];

        return response()->json($shareData);
    }

    // Get user's report
    public function getUserReports(Request $request)
    {
        $reports = UserReport::with(['alert', 'verifiedBy'])
            ->withCount(['comments', 'upvotes'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));
    
        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
            ]
        ]);
    }
}
