#!/data/data/com.termux/files/usr/bin/bash

# =====================================
# 🚀 GESTION AUTOMATIQUE DE SYNC GITHUB
# Compatible Termux / Android
# =====================================

set -e  # Arrêter en cas d'erreur

# =====================================
# 🔧 Configuration
# =====================================
GITHUB_USERNAME="Bello-Barry"
REPO_NAME="acode-ai-agent-pro"
PROJECT_DIR="/data/data/com.termux/files/home/acode-ai-agent"

# Aller dans le dossier du projet
cd "$PROJECT_DIR" || { 
    echo "❌ Dossier introuvable: $PROJECT_DIR" 
    exit 1 
}

echo "📁 Dossier: $(pwd)"
echo "🚀 Début synchronisation: $REPO_NAME"

# =====================================
# 🔐 Gestion du Token GitHub
# =====================================
if [ -f .env ]; then
    echo "📄 Chargement depuis .env"
    source .env
elif [ -f .env.local ]; then
    echo "📄 Chargement depuis .env.local"
    source .env.local
fi

# Demande interactive du token si absent
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN non trouvé."
    read -s -p "🔑 Saisis ton token GitHub : " GITHUB_TOKEN
    echo
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "❌ Token vide. Abandon."
        exit 1
    fi
    # Sauvegarde automatique
    echo "GITHUB_TOKEN=$GITHUB_TOKEN" > .env
    echo "✅ Token sauvegardé dans .env"
fi

# Vérification du format du token
if [[ ! "$GITHUB_TOKEN" =~ ^(ghp_|github_pat_) ]]; then
    echo "❌ Token invalide. Format attendu: ghp_... ou github_pat_..."
    exit 1
fi

# =====================================
# 🔍 Test du token GitHub
# =====================================
echo "🔍 Vérification du token GitHub..."
if curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -q '"login"'; then
    echo "✅ Token valide."
else
    echo "❌ Token invalide ou connexion impossible."
    echo "🔧 Vérifie ton token sur https://github.com/settings/tokens"
    exit 1
fi

# =====================================
# ⚙️ Initialisation Git
# =====================================
echo "⚙️ Configuration Git..."

# Initialiser le repo si nécessaire
if [ ! -d .git ]; then
    echo "🆕 Initialisation nouveau repository Git..."
    git init
fi

# Configurer l'utilisateur
git config user.name "$GITHUB_USERNAME"
git config user.email "bello.barry01@gmail.com"

# Configurer le remote
REMOTE_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$REMOTE_URL"
else
    git remote add origin "$REMOTE_URL"
fi

echo "✅ Git configuré."

# =====================================
# 📝 Premier commit si nécessaire
# =====================================
if [ ! -f README.md ]; then
    echo "📄 Création README.md..."
    cat > README.md << EOF
# AI Agent Pro - Plugin Acode

🤖 Assistant IA révolutionnaire pour Next.js 15 et multi-langages.

## Fonctionnalités
- Génération de code intelligent
- Correction et optimisation
- Création de projets Next.js 15
- Support multi-IA (DeepSeek, Gemini, OpenAI)

## Installation
\`\`\`javascript
acode.require('pluginManager').installPlugin('https://bello-barry.github.io/acode-ai-agent-pro/plugin.json')
\`\`\`

## Développement
Créé par Bello Barry - bello.barry01@gmail.com
EOF
fi

# =====================================
# 💾 Ajout des fichiers
# =====================================
echo "💾 Ajout des fichiers..."
git add .

# Vérifier s'il y a des changements
if git diff --cached --quiet; then
    echo "✅ Aucun changement à commiter."
else
    echo "📝 Création du commit..."
    git commit -m "🚀 Deploy AI Agent Pro v2.0

- Next.js 15 full support
- Multi-AI orchestration  
- Advanced code analysis
- Real-time suggestions
- Project scaffolding
- Enhanced performance"
fi

# =====================================
# 🌿 Gestion des branches
# =====================================
# Créer la branche main si elle n'existe pas
if ! git rev-parse --verify main >/dev/null 2>&1; then
    echo "🌿 Création branche main..."
    git branch -M main
fi

# =====================================
# 🔄 Synchronisation avec GitHub
# =====================================
echo "🔄 Synchronisation avec GitHub..."

# Essayer de récupérer les changements distants
if git ls-remote --exit-code origin main >/dev/null 2>&1; then
    echo "📥 Pull des derniers changements..."
    git pull origin main --rebase --allow-unrelated-histories
else
    echo "🆕 Premier push sur repository vide..."
fi

# =====================================
# 🚀 Push vers GitHub
# =====================================
echo "📤 Push vers GitHub..."
if git push -u origin main; then
    echo "✅ Push réussi !"
else
    echo "🔄 Tentative avec force push..."
    git push -u origin main --force
    echo "🔥 Push forcé réussi !"
fi

# =====================================
# 🎉 Finalisation
# =====================================
# Remettre l'URL normale (sans token)
git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "===================================="
echo "🎉 SYNCHRONISATION RÉUSSIE !"
echo "===================================="
echo "🌍 Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "📱 Plugin URL: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/plugin.json"
echo "📊 GitHub: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages"
echo "===================================="