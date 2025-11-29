<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use Illuminate\Database\Seeder;

class ServiceStructureSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'VISITES GUIDÉES & TOURISME INTERNATIONAL',
                'slug' => 'visites-guidees-tourisme-international',
                'description' => 'Visites guidées au Bénin et séjours touristiques internationaux avec des expériences culturelles, historiques et gastronomiques sur mesure.',
                'order' => 1,
            ],
        ];

        foreach ($categories as $index => $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'order' => $category['order'] ?? ($index + 1),
                    'is_active' => true,
                ]
            );
        }

        $destinations = [
            [
                'name' => 'France',
                'slug' => 'france',
                'code' => 'FR',
                'continent' => 'Europe',
                'flag_emoji' => '🇫🇷',
                'description' => 'Destination pour études, travail, tourisme et procédures d’immigration.',
            ],
            [
                'name' => 'Canada',
                'slug' => 'canada',
                'code' => 'CA',
                'continent' => 'Amérique du Nord',
                'flag_emoji' => '🇨🇦',
                'description' => 'Accompagnement pour immigration, études, travail et tourisme.',
            ],
            [
                'name' => 'Québec',
                'slug' => 'quebec',
                'code' => 'QC',
                'continent' => 'Amérique du Nord',
                'flag_emoji' => '🇨🇦',
                'description' => 'Province du Canada, spécialisée pour les démarches des primo-arrivants et travailleurs qualifiés (Arrima).',
            ],
            [
                'name' => 'États-Unis',
                'slug' => 'usa',
                'code' => 'US',
                'continent' => 'Amérique du Nord',
                'flag_emoji' => '🇺🇸',
                'description' => 'Destination pour les projets d’études et d’immigration aux USA.',
            ],
            [
                'name' => 'Rwanda',
                'slug' => 'rwanda',
                'code' => 'RW',
                'continent' => 'Afrique',
                'flag_emoji' => '🇷🇼',
                'description' => 'Destination touristique d’Afrique de l’Est pour safaris et découverte culturelle.',
            ],
            [
                'name' => 'Turquie',
                'slug' => 'turquie',
                'code' => 'TR',
                'continent' => 'Asie / Europe',
                'flag_emoji' => '🇹🇷',
                'description' => 'Destination alliant Orient et Occident pour tourisme et séjours.',
            ],
            [
                'name' => 'Belgique',
                'slug' => 'belgique',
                'code' => 'BE',
                'continent' => 'Europe',
                'flag_emoji' => '🇧🇪',
                'description' => 'Destination pour études supérieures à travers le programme Campus Belgique.',
            ],
            [
                'name' => 'Maroc',
                'slug' => 'maroc',
                'code' => 'MA',
                'continent' => 'Afrique',
                'flag_emoji' => '🇲🇦',
                'description' => 'Destination de la CAN 2025 et de séjours touristiques (Casablanca, Tanger, Rabat, Kénitra).',
            ],
            [
                'name' => 'Afrique du Sud',
                'slug' => 'afrique-du-sud',
                'code' => 'ZA',
                'continent' => 'Afrique',
                'flag_emoji' => '🇿🇦',
                'description' => 'Destination pour excursions et circuits touristiques (Le Cap, Durban, Parc Kruger...).',
            ],
            [
                'name' => 'Bénin',
                'slug' => 'benin',
                'code' => 'BJ',
                'continent' => 'Afrique',
                'flag_emoji' => '🇧🇯',
                'description' => 'Pays de base pour l’envoi de colis vers l’international et l’accueil de visiteurs étrangers.',
            ],
            [
                'name' => 'Sénégal',
                'slug' => 'senegal',
                'code' => 'SN',
                'continent' => 'Afrique',
                'flag_emoji' => '🇸🇳',
                'description' => 'Destination d’Afrique de l’Ouest pour séjours balnéaires et découvertes culturelles.',
            ],
        ];

        foreach ($destinations as $destination) {
            Destination::updateOrCreate(
                ['slug' => $destination['slug']],
                array_merge($destination, ['is_active' => true])
            );
        }
    }
}
