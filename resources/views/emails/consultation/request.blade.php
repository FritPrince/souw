<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle demande de consultation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .info-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info-box h2 {
            margin: 0 0 15px;
            font-size: 16px;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: 600;
            color: #555;
            width: 120px;
            flex-shrink: 0;
        }
        .info-value {
            color: #333;
        }
        .appointment-box {
            background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
            border: 2px solid #667eea30;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .appointment-box .date {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
        }
        .appointment-box .time {
            font-size: 18px;
            color: #555;
        }
        .message-box {
            background: #fff9e6;
            border-left: 4px solid #f0c14b;
            padding: 15px 20px;
            border-radius: 0 8px 8px 0;
        }
        .message-box h3 {
            margin: 0 0 10px;
            font-size: 14px;
            color: #856404;
        }
        .message-box p {
            margin: 0;
            color: #666;
            white-space: pre-wrap;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #888;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Nouvelle demande de consultation</h1>
            <p>Un client souhaite prendre rendez-vous avec vous</p>
        </div>
        
        <div class="content">
            <div class="appointment-box">
                <div class="date">{{ $appointmentDate }}</div>
                <div class="time">{{ $appointmentStartTime }} - {{ $appointmentEndTime }}</div>
            </div>

            <div class="info-box">
                <h2>👤 Informations du client</h2>
                <div class="info-row">
                    <span class="info-label">Nom :</span>
                    <span class="info-value">{{ $clientName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">E-mail :</span>
                    <span class="info-value"><a href="mailto:{{ $clientEmail }}">{{ $clientEmail }}</a></span>
                </div>
            </div>

            @if($clientMessage)
            <div class="message-box">
                <h3>💬 Message du client</h3>
                <p>{{ $clientMessage }}</p>
            </div>
            @endif

            <div style="text-align: center; margin-top: 25px;">
                <a href="mailto:{{ $clientEmail }}?subject=Confirmation%20de%20votre%20rendez-vous" class="btn">
                    Répondre au client
                </a>
            </div>
        </div>

        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis votre site web.</p>
            <p>© {{ date('Y') }} {{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>

