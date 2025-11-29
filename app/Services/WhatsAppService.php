<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $apiUrl;

    protected ?string $apiKey;

    protected ?string $phoneNumberId;

    protected ?string $accessToken;

    protected bool $enabled;

    public function __construct()
    {
        $this->enabled = config('whatsapp.enabled', false);
        $this->apiUrl = config('whatsapp.api_url', 'https://api.whatsapp.com');
        $this->apiKey = config('whatsapp.api_key');
        $this->phoneNumberId = config('whatsapp.phone_number_id');
        $this->accessToken = config('whatsapp.access_token');
    }

    /**
     * Envoyer un message texte
     */
    public function sendMessage(string $to, string $message): bool
    {
        if (! $this->enabled) {
            Log::info('WhatsApp disabled, message not sent', ['to' => $to]);
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->accessToken,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/v17.0/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhoneNumber($to),
                'type' => 'text',
                'text' => [
                    'body' => $message,
                ],
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent', [
                    'to' => $to,
                    'message_id' => $response->json('messages.0.id'),
                ]);
                return true;
            }

            Log::error('WhatsApp message failed', [
                'to' => $to,
                'response' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp service error', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Envoyer un message avec template
     */
    public function sendTemplate(string $to, string $templateName, array $parameters = []): bool
    {
        if (! $this->enabled) {
            return false;
        }

        try {
            $components = [];
            if (! empty($parameters)) {
                $components[] = [
                    'type' => 'body',
                    'parameters' => array_map(function ($param) {
                        return ['type' => 'text', 'text' => $param];
                    }, $parameters),
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->accessToken,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/v17.0/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhoneNumber($to),
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => ['code' => 'fr'],
                    'components' => $components,
                ],
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp template error', [
                'to' => $to,
                'template' => $templateName,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Envoyer un document
     */
    public function sendDocument(string $to, string $documentUrl, string $filename, ?string $caption = null): bool
    {
        if (! $this->enabled) {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->accessToken,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/v17.0/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhoneNumber($to),
                'type' => 'document',
                'document' => [
                    'link' => $documentUrl,
                    'filename' => $filename,
                    'caption' => $caption,
                ],
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp document error', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Formater le numéro de téléphone
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Supprimer tous les caractères non numériques
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Si le numéro commence par 0, le remplacer par l'indicatif du pays (ex: +229 pour Bénin)
        if (str_starts_with($phone, '0')) {
            $phone = '229'.substr($phone, 1);
        }

        // Si le numéro ne commence pas par +, l'ajouter
        if (! str_starts_with($phone, '+')) {
            $phone = '+'.$phone;
        }

        return $phone;
    }

    /**
     * Vérifier si WhatsApp est configuré
     */
    public function isConfigured(): bool
    {
        return $this->enabled
            && ! empty($this->phoneNumberId)
            && ! empty($this->accessToken);
    }
}
