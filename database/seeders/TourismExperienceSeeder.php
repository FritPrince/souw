<?php

namespace Database\Seeders;

use App\Models\TourismPackage;
use App\Models\TourismSite;
use Illuminate\Database\Seeder;

class TourismExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $sites = [
            [
                'name' => 'Ganvié, la cité lacustre',
                'slug' => 'ganvie',
                'description' => "Immersion au cœur du village lacustre de Ganvié sur le lac Nokoué, découverte des maisons sur pilotis, rencontre avec les pêcheurs et balade en pirogue traditionnelle.",
                'location' => 'Ganvié, Lac Nokoué',
                'images' => [
                    'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=1200&q=80',
                ],
                'duration' => 1,
                'price' => 45000,
            ],
            [
                'name' => 'Cascades de Tanongou',
                'slug' => 'cascades-de-tanongou',
                'description' => "Randonnée au pied de l’Atacora, baignade dans les piscines naturelles et rencontre avec les communautés locales autour de Tanongou.",
                'location' => 'Tanongou, Atacora',
                'images' => [
                    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
                ],
                'duration' => 1,
                'price' => 60000,
            ],
            [
                'name' => 'Tatas Somba authentiques',
                'slug' => 'tatas-somba',
                'description' => "Séjour d’exception dans les habitations traditionnelles des Somba, initiation aux savoir-faire et découverte de la vie communautaire.",
                'location' => 'Pays Somba, Natitingou',
                'images' => [
                    'https://images.unsplash.com/photo-1601784551446-20c9be54e2fa?auto=format&fit=crop&w=1200&q=80',
                ],
                'duration' => 2,
                'price' => 95000,
            ],
        ];

        foreach ($sites as $site) {
            TourismSite::updateOrCreate(
                ['slug' => $site['slug']],
                [
                    'name' => $site['name'],
                    'description' => $site['description'],
                    'location' => $site['location'],
                    'images' => $site['images'],
                    'duration' => $site['duration'],
                    'price' => $site['price'],
                    'is_active' => true,
                ]
            );
        }

        $packages = [
            [
                'name' => 'Escapade Sud Bénin',
                'slug' => 'escapade-sud-benin',
                'description' => "Circuit de 3 jours entre patrimoine historique et détente : Ganvié, Ouidah, Porto-Novo. Idéal pour une première immersion culturelle.",
                'duration_days' => 3,
                'price' => 180000,
                'image_path' => 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
                'media_type' => 'image',
                'includes' => [
                    'Hébergement confortable (chambre double)',
                    'Petits-déjeuners et déjeuners',
                    'Transport climatisé au départ de Cotonou',
                    'Guide francophone certifié',
                    'Visites guidées et droits d’entrée',
                    'Assistance 24/7 pendant le séjour',
                ],
                'itinerary' => [
                    'Jour 1 : Cotonou → Ganvié (départ matinal, balade en pirogue, installation à l’hôtel et soirée libre)',
                    'Jour 2 : Ouidah (Temple des Pythons, Route des Esclaves, dîner thématique avec spectacle)',
                    'Jour 3 : Porto-Novo (Musée Honmé, atelier percussion, retour à Cotonou en fin d’après-midi)',
                ],
            ],
            [
                'name' => 'Aventure Nord & Pays Somba',
                'slug' => 'aventure-nord-pays-somba',
                'description' => "Séjour de 5 jours dans le nord du Bénin : paysages grandioses de l’Atacora, cascades de Tanongou, immersion dans les Tatas Somba.",
                'duration_days' => 5,
                'price' => 320000,
                'image_path' => 'https://images.unsplash.com/photo-1548783963-59681aeb4b43?auto=format&fit=crop&w=1200&q=80',
                'media_type' => 'image',
                'includes' => [
                    'Hébergement lodge ou écolodge',
                    'Pension complète',
                    'Transport 4x4 avec chauffeur-guide',
                    'Excursions et visites sur site',
                    'Assurance assistance locale',
                    'Organisation d’un bivouac traditionnel',
                ],
                'itinerary' => [
                    'Jour 1 : Cotonou → Natitingou (vol ou route, installation en lodge panoramique, briefing autour du feu)',
                    'Jour 2 : Cascades de Tanongou (randonnée, baignade, rencontre artisans forgerons)',
                    'Jour 3 : Pays Somba (visite des tatas, atelier de cuisine, coucher de soleil sur l’Atacora)',
                    'Jour 4 : Safari faune & flore (observation en réserve, déjeuner champêtre, soirée contes et danses)',
                    'Jour 5 : Natitingou → Cotonou (centre artisanal, temps libre souvenirs, transfert retour)',
                ],
            ],
        ];

        foreach ($packages as $package) {
            TourismPackage::updateOrCreate(
                ['slug' => $package['slug']],
                [
                    'name' => $package['name'],
                    'description' => $package['description'],
                    'duration_days' => $package['duration_days'],
                    'price' => $package['price'],
                    'includes' => $package['includes'],
                    'itinerary' => $package['itinerary'],
                    'media_type' => 'image',
                    'image_path' => $package['image_path'] ?? null,
                    'is_active' => true,
                ]
            );
        }
    }
}


