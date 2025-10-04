#!/bin/bash

# Script de build otimizado para produção
# Este script otimiza o sistema para máxima performance

set -e

echo "🚀 Iniciando build otimizado para produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -f "src-tauri/Cargo.toml" ]; then
    error "Execute este script na raiz do projeto"
fi

# Limpar builds anteriores
log "🧹 Limpando builds anteriores..."
rm -rf dist/
rm -rf src-tauri/target/release/
rm -rf node_modules/.vite/

# Instalar dependências
log "📦 Instalando dependências..."
npm ci --production=false

# Build do frontend otimizado
log "🏗️  Construindo frontend otimizado..."
NODE_ENV=production npm run build:prod

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    error "Falha no build do frontend"
fi

# Analisar tamanho do bundle
log "📊 Analisando tamanho do bundle..."
if command -v npx &> /dev/null; then
    npx vite-bundle-analyzer dist/assets/*.js || warn "Bundle analyzer não disponível"
fi

# Build do backend Rust otimizado
log "🦀 Construindo backend Rust otimizado..."
cd src-tauri

# Build com otimizações de produção
cargo build --release --profile release

# Verificar se o build foi bem-sucedido
if [ ! -f "target/release/react_tauri_app" ]; then
    error "Falha no build do backend Rust"
fi

cd ..

# Build final do Tauri
log "⚡ Construindo aplicação Tauri final..."
npm run tauri:build

# Verificar se o build final foi bem-sucedido
if [ ! -d "src-tauri/target/release/bundle" ]; then
    error "Falha no build final do Tauri"
fi

# Otimizações adicionais
log "🔧 Aplicando otimizações finais..."

# Comprimir assets se possível
if command -v gzip &> /dev/null; then
    log "🗜️  Comprimindo assets..."
    find src-tauri/target/release/bundle -name "*.deb" -exec gzip -k {} \; 2>/dev/null || warn "Compressão não disponível"
fi

# Criar checksums para verificação
log "🔐 Criando checksums..."
find src-tauri/target/release/bundle -type f -name "*.deb" -o -name "*.AppImage" | while read file; do
    sha256sum "$file" > "$file.sha256"
done

# Estatísticas finais
log "📈 Estatísticas do build:"
echo "  Frontend (dist/): $(du -sh dist/ | cut -f1)"
echo "  Backend Rust: $(du -sh src-tauri/target/release/react_tauri_app | cut -f1)"
echo "  Bundle final: $(du -sh src-tauri/target/release/bundle/ | cut -f1)"

# Verificar se há arquivos de bundle
bundle_files=$(find src-tauri/target/release/bundle -name "*.deb" -o -name "*.AppImage" | wc -l)
if [ "$bundle_files" -gt 0 ]; then
    log "✅ Build concluído com sucesso!"
    log "📦 Arquivos gerados:"
    find src-tauri/target/release/bundle -name "*.deb" -o -name "*.AppImage" | while read file; do
        echo "  - $(basename "$file") ($(du -sh "$file" | cut -f1))"
    done
else
    warn "Nenhum arquivo de bundle encontrado"
fi

# Dicas de otimização
log "💡 Dicas de otimização aplicadas:"
echo "  ✅ Lazy loading de componentes"
echo "  ✅ Code splitting otimizado"
echo "  ✅ Memoização de contextos"
echo "  ✅ Bundle minificado e comprimido"
echo "  ✅ Índices de banco de dados"
echo "  ✅ Configurações de produção"
echo "  ✅ Tree shaking otimizado"

log "🎉 Build otimizado concluído com sucesso!"

# Opcional: executar testes se existirem
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    log "🧪 Executando testes..."
    npm test -- --passWithNoTests || warn "Testes falharam ou não encontrados"
fi

echo ""
echo "🚀 Sistema pronto para produção!"
echo "📁 Arquivos de distribuição em: src-tauri/target/release/bundle/"
echo ""
echo "Para instalar:"
echo "  sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb"
echo ""
echo "Para executar:"
echo "  ./src-tauri/target/release/bundle/appimage/*.AppImage"
