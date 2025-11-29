<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Destination;
use App\Models\RequiredDocument;
use App\Models\Service;
use App\Models\ServiceFormField;
use App\Models\ServiceProcessingTime;
use App\Models\SubService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExampleServicesSeeder extends Seeder
{
    public function run(): void
    {
        // S’assurer que la structure de base (catégories & destinations) existe
            $this->call(ServiceStructureSeeder::class);

        // Nettoyage complet des anciens services et données liées
        DB::table('service_destination')->delete();
        ServiceFormField::query()->delete();
        ServiceProcessingTime::query()->delete();
        RequiredDocument::query()->delete();
        SubService::query()->delete();
        Service::query()->delete();

        $categories = Category::query()
            ->whereIn('slug', [
                'visites-guidees-tourisme-international',
            ])
            ->get()
            ->keyBy('slug');

        $services = [
            // Tourisme au Bénin
            [
                'slug' => 'tourisme-au-benin',
                'name' => 'Tourisme au Bénin',
                'category_slug' => 'visites-guidees-tourisme-international',
                'description' => "Tourisme au Bénin : découvrez les sites emblématiques du pays.\n"
                    . "★ La Porte du Non-Retour (Ouidah)\n"
                    . "★ Le Village Lacustre de Ganvié\n"
                    . "★ Les Chutes de Tanongou\n"
                    . "★ Les Tatas Somba du Nord\n\n"
                    . "Nos packs incluent :\n"
                    . "✔ Hébergement & transport\n"
                    . "✔ Accompagnement professionnel\n"
                    . "✔ Assistance visa et assurance voyage\n"
                    . "✔ Expériences culturelles et gastronomiques",
                'price' => 0,
                'requires_appointment' => false,
                'destinations' => ['benin'],
            ],
            // Destinations internationales
            [
                'slug' => 'destinations-internationales',
                'name' => 'Destinations internationales',
                'category_slug' => 'visites-guidees-tourisme-international',
                'description' => "Destinations internationales : vivez le meilleur du tourisme international avec SouwTravel.\n"
                    . "🇿🇦 Afrique du Sud\n"
                    . "🇦🇪 Dubai\n"
                    . "🇸🇳 Sénégal\n"
                    . "🇫🇷 France\n\n"
                    . "Nos packs incluent :\n"
                    . "✔ Hébergement & transport\n"
                    . "✔ Accompagnement professionnel\n"
                    . "✔ Assistance visa et assurance voyage\n"
                    . "✔ Expériences culturelles et gastronomiques",
                'price' => 0,
                'requires_appointment' => false,
                'destinations' => ['afrique-du-sud', 'dubai', 'senegal', 'france'],
            ],
        ];

        foreach ($services as $serviceData) {
            $category = $categories[$serviceData['category_slug']] ?? null;

            if (! $category) {
                continue;
            }

            $service = Service::updateOrCreate(
                ['slug' => $serviceData['slug']],
                [
                    'category_id' => $category->id,
                    'name' => $serviceData['name'],
                    'description' => $serviceData['description'],
                    'price' => $serviceData['price'],
                    'is_active' => true,
                    'requires_appointment' => $serviceData['requires_appointment'],
                    'media_type' => 'image',
                ]
            );

            $destinationIds = Destination::whereIn('slug', $serviceData['destinations'] ?? [])->pluck('id');

            if ($destinationIds->isNotEmpty()) {
                $service->destinations()->sync(
                    $destinationIds->mapWithKeys(fn ($id) => [$id => ['is_active' => true]])
                );
            }
        }
    }
}

