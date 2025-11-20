<?php

namespace Database\Seeders;

use App\Models\SafetyTip;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SafetyTipSeeder extends Seeder
{
    public function run(): void
    {
        $safetyTips = [
            // Earthquake Tips
            [
                'disaster_type' => 'earthquake',
                'severity_level' => 'medium',
                'title' => 'During an Earthquake: Drop, Cover, and Hold On',
                'content' => 'Drop to your hands and knees. Cover your head and neck with your arms. Hold on to any sturdy covering until the shaking stops.',
                'short_description' => 'Basic earthquake safety procedure',
                'source' => 'FEMA',
                'is_active' => true,
                'order' => 1,
                'tags' => ['earthquake', 'safety', 'procedure'],
            ],
            [
                'disaster_type' => 'earthquake',
                'severity_level' => 'medium',
                'title' => 'Earthquake Preparedness Kit',
                'content' => 'Prepare an emergency kit with water, non-perishable food, flashlight, batteries, first aid kit, medications, and important documents.',
                'short_description' => 'Essential items for earthquake preparedness',
                'source' => 'Red Cross',
                'is_active' => true,
                'order' => 2,
                'tags' => ['earthquake', 'preparedness', 'kit'],
            ],

            // Flood Tips
            [
                'disaster_type' => 'flood',
                'severity_level' => 'critical',
                'title' => 'Flood Safety: Move to Higher Ground',
                'content' => 'Immediately move to higher ground when flooding occurs. Avoid walking or driving through flood waters.',
                'short_description' => 'Immediate actions during flooding',
                'source' => 'NDRRMC',
                'is_active' => true,
                'order' => 1,
                'tags' => ['flood', 'safety', 'evacuation'],
            ],
            [
                'disaster_type' => 'flood',
                'severity_level' => 'critical',
                'title' => 'Flood Warning Signs',
                'content' => 'Watch for rising water levels, heavy rainfall, and official flood warnings. Evacuate immediately if instructed.',
                'short_description' => 'Recognizing flood danger signs',
                'source' => 'PAGASA',
                'is_active' => true,
                'order' => 2,
                'tags' => ['flood', 'warning', 'evacuation'],
            ],

            // Storm Tips
            [
                'disaster_type' => 'storm',
                'severity_level' => 'medium',
                'title' => 'Typhoon Preparedness',
                'content' => 'Secure outdoor objects, stock emergency supplies, charge electronic devices, and monitor weather updates regularly.',
                'short_description' => 'Preparation steps for incoming storms',
                'source' => 'PAGASA',
                'is_active' => true,
                'order' => 1,
                'tags' => ['storm', 'typhoon', 'preparedness'],
            ],
            [
                'disaster_type' => 'storm',
                'severity_level' => 'critical',
                'title' => 'During a Severe Storm',
                'content' => 'Stay indoors away from windows. Avoid using electrical appliances. Have a battery-powered radio for updates.',
                'short_description' => 'Safety during severe storm conditions',
                'source' => 'Red Cross',
                'is_active' => true,
                'order' => 2,
                'tags' => ['storm', 'safety', 'emergency'],
            ],

            // General Tips
            [
                'disaster_type' => 'wildfire',
                'severity_level' => 'low',
                'title' => 'Emergency Communication Plan',
                'content' => 'Establish family meeting points and communication methods. Designate out-of-area contacts.',
                'short_description' => 'Family emergency communication planning',
                'source' => 'FEMA',
                'is_active' => true,
                'order' => 1,
                'tags' => ['communication', 'planning', 'family'],
            ],
        ];

        foreach ($safetyTips as $tipData) {
            SafetyTip::create($tipData);
        }
    }
}
