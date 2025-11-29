@php
    $serviceName = $service?->name ?? 'Service';
    $subServiceName = $subService?->name ?? ($order->subService->name ?? null);
    $destinationName = $destination?->name ?? ($order->destination->name ?? null);
@endphp

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Confirmation de commande</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2933; background-color: #f7fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 8px; }
        h1 { font-size: 20px; margin-bottom: 16px; }
        p { line-height: 1.5; margin: 8px 0; }
        .highlight { font-weight: bold; color: #1a202c; }
        .cta { display: inline-block; margin-top: 24px; padding: 12px 20px; background-color: #0f7bff; color: #ffffff; text-decoration: none; border-radius: 6px; }
        .footer { margin-top: 32px; font-size: 12px; color: #718096; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bonjour {{ $user?->name ?? 'Cher client' }},</h1>

        <p>Nous vous confirmons la réception de votre commande <span class="highlight">#{{ $order->order_number }}</span>.</p>

        <p>Service : <span class="highlight">{{ $serviceName }}</span></p>

        @if($subServiceName)
            <p>Option / sous-service : <span class="highlight">{{ $subServiceName }}</span></p>
        @endif

        @if($destinationName)
            <p>Destination : <span class="highlight">{{ $destinationName }}</span></p>
        @endif

        <p>Montant réglé : <span class="highlight">{{ number_format($order->total_amount, 0, ',', ' ') }} XOF</span></p>

        <p>Statut actuel : <span class="highlight">{{ ucfirst($order->status) }}</span></p>

        <a class="cta" href="{{ route('orders.show', $order) }}">Consulter ma commande</a>

        @if(isset($documents) && count($documents) > 0)
            <div style="margin-top:24px;">
                <h2 style="font-size:16px; margin-bottom:12px;">Documents fournis</h2>
                <ul style="padding-left:16px;">
                    @foreach($documents as $doc)
                        <li style="margin-bottom:8px;">
                            <strong>{{ $doc['name'] }}</strong>
                            <span style="color:#4a5568; font-size:12px;"> — {{ $doc['uploaded_at'] }}</span>
                            @if(!empty($doc['mime']))
                                <span style="color:#718096; font-size:12px;"> ({{ $doc['mime'] }})</span>
                            @endif
                            @if(!empty($doc['url']))
                                <br>
                                <a href="{{ $doc['url'] }}" style="color:#0f7bff; font-size:12px;">Télécharger</a>
                            @endif
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif

        <p class="footer">Merci pour votre confiance. Toute l'équipe SouwTravel reste à votre disposition.</p>
    </div>
</body>
</html>
