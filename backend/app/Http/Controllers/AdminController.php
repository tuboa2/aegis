<?php

namespace App\Http\Controllers;

use App\Models\UserReport;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminController extends Controller
{
    // Get reports for admin review
    public function getReportsForReview(Request $request)
    {
        $query = UserReport::with(['user', 'alert'])
            ->withCount(['comments', 'upvotes'])
            ->where('status', UserReport::STATUS_PENDING)
            ->orderBy('created_at', 'desc');
        
        if ($request->has('type') && $request->type !== 'all') {
            $query->type($request->type);
        }

        $reports = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
            ]
        ]);
    }

    // Verify a user report
    public function verifyReport(Request $request, UserReport $report)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500', 
        ]);

        $report->update([
            'status' => UserReport::STATUS_VERIFIED,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        // Create alert from verified report if significant
        if (in_array($report->severity, ['high', 'critical'])) {
            $this->createAlertFromReport($report);
        }

        $report->load(['user', 'alert', 'verifiedBy']);

        return response()->json([
            'message' => 'Report verified successfully',
            'report' => $report
        ]);
    }

    public function rejectReport(Request $request, UserReport $report)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);
        
        $report->update([
            'status' => UserReport::STATUS_REJECTED,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Report rejected successfully',
            'report' => $report
        ]);
    }

    // Create alert from verified report
    private function createAlertFromReport(UserReport $report)
    {
        $alert = \App\Models\DisasterAlert::create([
            'user_id' => $report->user_id,
            'title' => $report->title,
            'description' => $report->description,
            'type' => $report->type,
            'severity' => $report->severity,
            'latitude' => $report->latitude,
            'longitude' => $report->longitude,
            'radius_km' => $this->calculateRadiusFromSeverity($report->severity),
            'source' => 'user_report',
            'started_at' => $report->created_at,
            'is_active' => true,
            'metadata' => [
                'original_report_id' => $report->id,
                'verified_by' => $report->verified_by,
                'media_urls' => $report->media_urls,
            ]
        ]);

        return $alert;
    }

    // Calculate alert radius based on severity
    private function calculateRadiusFromSeverity($severity): float
    {
        return match($severity) {
            'critical' => 100.0,
            'high' => 50.0,
            'medium' => 25.0,
            'low' => 10.0,
            default => 10.0,
        };
    }

    // Get community statistics
    public function getCommunityStats()
    {
        $stats = [
            'total_reports' => UserReport::count(),
            'verified_reports' => UserReport::verified()->count,
            'pending_reports' => UserReport::where('status', UserReport::STATUS_PENDING)->count(),
            'reports_by_type' => UserReport::selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type'),
            'recent_activity' => UserReport::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
        ];

        return response()->json($stats);
    }
}
