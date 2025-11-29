<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CompanyInfo;
use App\Models\Destination;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class HomePageSeeder extends Seeder
{
    public function run(): void
    {
        // Upsert company info
        CompanyInfo::updateOrCreate(
            ['name' => 'SouwTravel'],
            [
                'hero_image_path' => '/storage/front/images/hero-bg.jpg',
                'hero_video_path' => '/storage/front/video/video-bg.mp4',
                'hero_media_type' => 'video',
                'info_section1_image' => '/storage/front/images/img1.jpg',
                'info_section2_image' => '/storage/front/images/img2.jpg',
                'info_section3_image' => '/storage/front/images/img3.jpg',
                'info_section1_badge' => '+1200 clients',
                'info_section2_badge' => '24/7',
                'info_section3_badge' => '100% sécurisé',
            ]
        );

        // Testimonials
        $testimonials = [
            [
                'name' => 'Aïcha K.',
                'role' => 'Entrepreneure',
                'avatar_path' => '/storage/front/images/team8.jpg',
                'rating' => 5,
                'content' => "Service impeccable ! Mon visa a été obtenu plus vite que prévu. L'équipe est très réactive.",
                'is_active' => true,
            ],
            [
                'name' => 'Jean-Paul D.',
                'role' => 'Consultant',
                'avatar_path' => '/storage/front/images/team9.jpg',
                'rating' => 5,
                'content' => "Excellent accompagnement pour mes démarches de séjour. Communication claire et efficace.",
                'is_active' => true,
            ],
            [
                'name' => 'Mireille S.',
                'role' => 'Étudiante',
                'avatar_path' => '/storage/front/images/team10.jpg',
                'rating' => 4,
                'content' => "J'ai adoré l'expérience : conseils, suivi et sérieux. Je recommande SouwTravel !",
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $t) {
            Testimonial::updateOrCreate(
                [
                    'name' => $t['name'],
                    'role' => $t['role'],
                ],
                $t,
            );
        }

        // Create Categories
        $categories = [
            [
                'name' => 'VISA & IMMIGRATION',
                'slug' => 'visa-immigration',
                'description' => 'Services de visa et d\'immigration pour tous vos besoins de voyage',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'SÉJOUR & LOGISTIQUE',
                'slug' => 'sejour-logistique',
                'description' => 'Gestion de séjour et services logistiques',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'DOCUMENTS ADMINISTRATIFS',
                'slug' => 'documents-administratifs',
                'description' => 'Obtention et légalisation de documents administratifs',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'ACCOMPAGNEMENT',
                'slug' => 'accompagnement',
                'description' => 'Services d\'accompagnement personnalisés',
                'order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        // Create Destinations
        $destinations = [
            [
                'name' => 'France',
                'slug' => 'france',
                'code' => 'FR',
                'continent' => 'Europe',
                'flag_emoji' => '🇫🇷',
                'description' => 'Découvrez la France avec nos services de visa et d\'immigration',
                'image_path' => '/storage/front/images/destination-img.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'États-Unis',
                'slug' => 'etats-unis',
                'code' => 'US',
                'continent' => 'Amérique du Nord',
                'flag_emoji' => '🇺🇸',
                'description' => 'Services complets pour voyager aux États-Unis',
                'image_path' => '/storage/front/images/destination-img2.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'Canada',
                'slug' => 'canada',
                'code' => 'CA',
                'continent' => 'Amérique du Nord',
                'flag_emoji' => '🇨🇦',
                'description' => 'Immigration et visa pour le Canada',
                'image_path' => '/storage/front/images/destination-img3.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'Royaume-Uni',
                'slug' => 'royaume-uni',
                'code' => 'GB',
                'continent' => 'Europe',
                'flag_emoji' => '🇬🇧',
                'description' => 'Services de visa pour le Royaume-Uni',
                'image_path' => '/storage/front/images/destination-img4.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'Allemagne',
                'slug' => 'allemagne',
                'code' => 'DE',
                'continent' => 'Europe',
                'flag_emoji' => '🇩🇪',
                'description' => 'Visa et séjour en Allemagne',
                'image_path' => '/storage/front/images/destination-img5.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'Espagne',
                'slug' => 'espagne',
                'code' => 'ES',
                'continent' => 'Europe',
                'flag_emoji' => '🇪🇸',
                'description' => 'Services pour l\'Espagne',
                'image_path' => '/storage/front/images/destination-img2.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'Italie',
                'slug' => 'italie',
                'code' => 'IT',
                'continent' => 'Europe',
                'flag_emoji' => '🇮🇹',
                'description' => 'Visa et tourisme en Italie',
                'image_path' => '/storage/front/images/destination-img3.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
            [
                'name' => 'Dubai',
                'slug' => 'dubai',
                'code' => 'AE',
                'continent' => 'Asie',
                'flag_emoji' => '🇦🇪',
                'description' => 'Services pour Dubai et les Émirats Arabes Unis',
                'image_path' => '/storage/front/images/destination-img4.jpg',
                'media_type' => 'image',
                'is_active' => true,
            ],
        ];

        foreach ($destinations as $destinationData) {
            Destination::updateOrCreate(
                ['slug' => $destinationData['slug']],
                $destinationData
            );
        }

        // Services
        $visaCategory = Category::where('slug', 'visa-immigration')->first();
        $sejourCategory = Category::where('slug', 'sejour-logistique')->first();
        $docCategory = Category::where('slug', 'documents-administratifs')->first();
        $accompCategory = Category::where('slug', 'accompagnement')->first();

        $services = [
            [
                'category_id' => $visaCategory->id,
                'name' => 'Visa Touristique',
                'slug' => 'visa-touristique',
                'description' => 'Obtenez votre visa touristique rapidement et facilement',
                'image_path' => '/storage/front/images/destination-img.jpg',
                'media_type' => 'image',
                'price' => 50000,
                'is_active' => true,
                'requires_appointment' => false,
            ],
            [
                'category_id' => $visaCategory->id,
                'name' => 'Visa Affaires',
                'slug' => 'visa-affaires',
                'description' => 'Visa pour vos déplacements professionnels',
                'image_path' => '/storage/front/images/destination-img2.jpg',
                'media_type' => 'image',
                'price' => 75000,
                'is_active' => true,
                'requires_appointment' => false,
            ],
            [
                'category_id' => $visaCategory->id,
                'name' => 'Visa Études',
                'slug' => 'visa-etudes',
                'description' => 'Visa étudiant pour poursuivre vos études à l\'étranger',
                'image_path' => '/storage/front/images/destination-img3.jpg',
                'media_type' => 'image',
                'price' => 60000,
                'is_active' => true,
                'requires_appointment' => true,
            ],
            [
                'category_id' => $sejourCategory->id,
                'name' => 'Prolongation de Séjour',
                'slug' => 'prolongation-sejour',
                'description' => 'Prolongez votre séjour légalement',
                'image_path' => '/storage/front/images/destination-img4.jpg',
                'media_type' => 'image',
                'price' => 45000,
                'is_active' => true,
                'requires_appointment' => true,
            ],
            [
                'category_id' => $docCategory->id,
                'name' => 'Légalisation de Documents',
                'slug' => 'legalisation-documents',
                'description' => 'Légalisation et apostille de vos documents',
                'image_path' => '/storage/front/images/destination-img5.jpg',
                'media_type' => 'image',
                'price' => 30000,
                'is_active' => true,
                'requires_appointment' => false,
            ],
            [
                'category_id' => $accompCategory->id,
                'name' => 'Accompagnement Personnalisé',
                'slug' => 'accompagnement-personnalise',
                'description' => 'Service d\'accompagnement complet pour vos démarches',
                'image_path' => '/storage/front/images/destination-img.jpg',
                'media_type' => 'image',
                'price' => 100000,
                'is_active' => true,
                'requires_appointment' => true,
            ],
        ];

        foreach ($services as $serviceData) {
            $service = Service::updateOrCreate(
                ['slug' => $serviceData['slug']],
                $serviceData
            );

            if (in_array($serviceData['slug'], ['visa-touristique', 'visa-affaires'])) {
                $service->destinations()->syncWithoutDetaching(
                    Destination::whereIn('slug', ['france', 'etats-unis', 'canada', 'royaume-uni'])->pluck('id')
                );
            }
        }
    }
}
