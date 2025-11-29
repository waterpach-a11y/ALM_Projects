#!/bin/bash

# Script pour configurer SendGrid pour les rapports par email
# Usage: ./setup-email.sh

echo "📧 Configuration de SendGrid pour les rapports hebdomadaires"
echo ""

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé."
    echo "   Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Demander la clé API SendGrid
echo "1. Créez une API Key dans SendGrid:"
echo "   - Allez sur https://sendgrid.com"
echo "   - Settings > API Keys > Create API Key"
echo "   - Donnez un nom et sélectionnez 'Full Access' ou 'Restricted Access' avec Mail Send"
echo ""
read -p "Entrez votre clé API SendGrid: " SENDGRID_API_KEY

if [ -z "$SENDGRID_API_KEY" ]; then
    echo "❌ La clé API ne peut pas être vide"
    exit 1
fi

# Demander l'email expéditeur
echo ""
echo "2. Vérifiez un expéditeur dans SendGrid:"
echo "   - Settings > Sender Authentication > Verify a Single Sender"
echo ""
read -p "Entrez l'email expéditeur (ex: noreply@votredomaine.com): " FROM_EMAIL

if [ -z "$FROM_EMAIL" ]; then
    FROM_EMAIL="noreply@almproject.com"
    echo "   Utilisation de l'email par défaut: $FROM_EMAIL"
fi

# Configurer Firebase Functions
echo ""
echo "🔧 Configuration de Firebase Functions..."
firebase functions:config:set sendgrid.api_key="$SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from_email="$FROM_EMAIL"

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 Vérification de la configuration:"
firebase functions:config:get

echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Déployez les fonctions: firebase deploy --only functions"
echo "   2. Testez manuellement avec: firebase functions:shell"
echo "   3. Les rapports seront envoyés automatiquement chaque lundi à 9h00"
echo ""

