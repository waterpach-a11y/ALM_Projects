# Script PowerShell pour configurer SendGrid pour les rapports par email
# Usage: .\setup-email.ps1

Write-Host "📧 Configuration de SendGrid pour les rapports hebdomadaires" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Firebase CLI est installé
try {
    $null = Get-Command firebase -ErrorAction Stop
} catch {
    Write-Host "❌ Firebase CLI n'est pas installé." -ForegroundColor Red
    Write-Host "   Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Demander la clé API SendGrid
Write-Host "1. Créez une API Key dans SendGrid:" -ForegroundColor Yellow
Write-Host "   - Allez sur https://sendgrid.com" -ForegroundColor Gray
Write-Host "   - Settings > API Keys > Create API Key" -ForegroundColor Gray
Write-Host "   - Donnez un nom et sélectionnez 'Full Access' ou 'Restricted Access' avec Mail Send" -ForegroundColor Gray
Write-Host ""
$SENDGRID_API_KEY = Read-Host "Entrez votre clé API SendGrid"

if ([string]::IsNullOrWhiteSpace($SENDGRID_API_KEY)) {
    Write-Host "❌ La clé API ne peut pas être vide" -ForegroundColor Red
    exit 1
}

# Demander l'email expéditeur
Write-Host ""
Write-Host "2. Vérifiez un expéditeur dans SendGrid:" -ForegroundColor Yellow
Write-Host "   - Settings > Sender Authentication > Verify a Single Sender" -ForegroundColor Gray
Write-Host ""
$FROM_EMAIL = Read-Host "Entrez l'email expéditeur (ex: noreply@votredomaine.com)"

if ([string]::IsNullOrWhiteSpace($FROM_EMAIL)) {
    $FROM_EMAIL = "noreply@almproject.com"
    Write-Host "   Utilisation de l'email par défaut: $FROM_EMAIL" -ForegroundColor Gray
}

# Configurer Firebase Functions
Write-Host ""
Write-Host "🔧 Configuration de Firebase Functions..." -ForegroundColor Cyan
Write-Host ""

# Utiliser le script Node.js qui gère mieux les caractères spéciaux
$scriptPath = Join-Path $PSScriptRoot "set-env.js"
if (Test-Path $scriptPath) {
    Write-Host "   Utilisation du script Node.js (recommandé)..." -ForegroundColor Gray
    node $scriptPath
} else {
    # Fallback vers la méthode directe
    Write-Host "   Configuration avec functions.config()..." -ForegroundColor Gray
    $SENDGRID_API_KEY_ESCAPED = $SENDGRID_API_KEY -replace '"', '\"'
    $FROM_EMAIL_ESCAPED = $FROM_EMAIL -replace '"', '\"'
    
    firebase functions:config:set "sendgrid.api_key=$SENDGRID_API_KEY_ESCAPED"
    firebase functions:config:set "sendgrid.from_email=$FROM_EMAIL_ESCAPED"
}

Write-Host ""
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Vérification de la configuration:" -ForegroundColor Cyan
firebase functions:config:get

Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Déployez les fonctions: firebase deploy --only functions" -ForegroundColor Gray
Write-Host "   2. Testez manuellement avec: firebase functions:shell" -ForegroundColor Gray
Write-Host "   3. Les rapports seront envoyés automatiquement chaque lundi à 9h00" -ForegroundColor Gray
Write-Host ""

