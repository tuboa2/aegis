<?php

namespace Database\Seeders;

use App\Models\DisasterAlert;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DisasterAlertSeeder extends Seeder
{
    
    public function run(): void
    {
        $demoAlerts = [
            [
                'title' => 'Magnitude 6.2 Earthquake - Mindanao',
                'description' => 'A strong earthquake detected in Mindanao region. Potential for aftershocks.',
                'type' => 'earthquake',
                'severity' => 'high',
                'latitude' => 6.9603,
                'longitude' => 125.4419,
                'radius_km' => 300,
                'source' => 'usgs',
                'external_id' => 'demo-earthquake-1',
                'started_at' => now()->subHours(2),
                'is_active' => true,
                'metadata' => [
                    'magnitude' => 6.2,
                    'depth' => 10,
                    'location' => 'Mindanao, Philippines'
                ]
            ],
            [
                'title' => 'Tropical Storm Warning - Luzon',
                'description' => 'Tropical storm approaching northern Luzon with heavy rainfall expected.',
                'type' => 'storm',
                'severity' => 'medium',
                'latitude' => 16.0419,
                'longitude' => 120.3319,
                'radius_km' => 450,
                'source' => 'openweather',
                'external_id' => 'demo-storm-1',
                'started_at' => now()->subHours(5),
                'expires_at' => now()->addDays(2),
                'is_active' => true,
                'metadata' => [
                    'wind_speed' => 85,
                    'category' => 'Tropical Storm'
                ]
            ],
            [
                'title' => 'Flood Alert - Metro Manila',
                'description' => 'Heavy rainfall causing flooding in low-lying areas of Metro Manila.',
                'type' => 'flood',
                'severity' => 'medium',
                'latitude' => 14.5995,
                'longitude' => 120.9842,
                'radius_km' => 50,
                'source' => 'user_report',
                'external_id' => 'demo-flood-1',
                'started_at' => now()->subHours(1),
                'is_active' => true,
                'metadata' => [
                    'water_level' => '1.2m',
                    'affected_areas' => ['Taft Avenue', 'España']
                ]
            ]
        ];

        foreach ($demoAlerts as $alertData) {
            DisasterAlert::create($alertData);
        }
    }
}
