#!/bin/bash

# Script para gerar chaves de assinatura para o sistema de atualização
# Execute este script para gerar suas próprias chaves de segurança

echo "🔑 Gerando chaves de assinatura para o sistema de atualização..."

# Criar diretório para as chaves se não existir
mkdir -p keys

# Gerar chave privada
echo "📝 Gerando chave privada..."
openssl genpkey -algorithm RSA -out keys/private.key -pkcs8 -pass pass:your_password_here

# Gerar chave pública
echo "📝 Gerando chave pública..."
openssl rsa -pubout -in keys/private.key -out keys/public.pem -passin pass:your_password_here

# Gerar chave pública no formato base64 para o Tauri
echo "📝 Gerando chave pública em base64 para Tauri..."
openssl rsa -pubin -in keys/public.pem -outform DER | base64 > keys/tauri-pubkey.txt

echo ""
echo "✅ Chaves geradas com sucesso!"
echo ""
echo "📁 Arquivos criados:"
echo "   - keys/private.key (chave privada - mantenha segura!)"
echo "   - keys/public.pem (chave pública)"
echo "   - keys/tauri-pubkey.txt (chave pública para Tauri)"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Copie o conteúdo de keys/tauri-pubkey.txt"
echo "   2. Cole no arquivo tauri.conf.json na seção 'pubkey'"
echo "   3. Use a chave privada para assinar seus releases"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Mantenha a chave privada (private.key) segura e nunca a compartilhe"
echo "   - Faça backup das chaves em local seguro"
echo "   - Use a mesma chave para assinar todas as atualizações"
echo ""

# Mostrar a chave pública para Tauri
echo "🔑 Chave pública para tauri.conf.json:"
echo "----------------------------------------"
cat keys/tauri-pubkey.txt
echo "----------------------------------------"
