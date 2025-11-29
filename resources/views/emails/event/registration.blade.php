<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle inscription - {{ $event->name }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                🎉 Nouvelle Inscription
                            </h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">
                                {{ $event->name }}
                            </p>
                        </td>
                    </tr>

                    <!-- Reference -->
                    <tr>
                        <td style="padding: 30px 30px 0;">
                            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 5px; color: #166534; font-size: 14px;">Référence</p>
                                <p style="margin: 0; color: #166534; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                                    {{ $registration->reference }}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Pack Info -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 15px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>Pack choisi :</strong> {{ $pack->name }} - {{ number_format($pack->price, 0, ',', ' ') }} {{ $pack->currency }}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Personal Info -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
                                Informations personnelles
                            </h2>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Nom complet</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->full_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Sexe</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->gender_label }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date de naissance</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->birth_date->format('d/m/Y') }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Lieu de naissance</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->birth_place }}, {{ $registration->birth_country }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Nationalité</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->nationality }}</td>
                                </tr>
                                @if($registration->profession)
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Profession</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->profession }}</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>

                    <!-- Contact Info -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
                                Coordonnées
                            </h2>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Adresse</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->address }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Pays de résidence</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->residence_country }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                                    <td style="padding: 8px 0; color: #0891b2; font-size: 14px; font-weight: 500;">
                                        <a href="mailto:{{ $registration->email }}" style="color: #0891b2; text-decoration: none;">{{ $registration->email }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Téléphone</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{ $registration->phone }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #64748b; font-size: 13px;">
                                Inscription reçue le {{ $registration->created_at->format('d/m/Y à H:i') }}
                            </p>
                            <p style="margin: 10px 0 0; color: #94a3b8; font-size: 12px;">
                                Cet email a été envoyé automatiquement par SouwTravel
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

