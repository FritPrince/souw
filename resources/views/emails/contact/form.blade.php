<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Nouveau message de contact</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2933; background-color: #f7fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 8px; }
        h1 { font-size: 20px; margin-bottom: 16px; color: #1a202c; }
        h2 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; color: #2d3748; }
        p { line-height: 1.6; margin: 8px 0; }
        .highlight { font-weight: bold; color: #1a202c; }
        .message-box { background-color: #f7fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #3182ce; margin: 16px 0; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .footer { margin-top: 28px; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Nouveau message de contact</h1>

        <h2>Informations du contact</h2>
        <div class="info-row">
            <p><span class="highlight">Nom :</span> {{ $clientName }}</p>
        </div>
        <div class="info-row">
            <p><span class="highlight">Email :</span> {{ $clientEmail }}</p>
        </div>
        <div class="info-row">
            <p><span class="highlight">Téléphone :</span> {{ $clientPhone }}</p>
        </div>

        <h2>Sujet</h2>
        <p><span class="highlight">{{ $subject }}</span></p>

        <h2>Message</h2>
        <div class="message-box">
            <p style="white-space: pre-wrap;">{{ $message }}</p>
        </div>

        <div class="footer">
            <p>Ce message a été envoyé depuis le formulaire de contact du site web.</p>
            <p>Vous pouvez répondre directement à cet email pour contacter le client.</p>
        </div>
    </div>
</body>
</html>
