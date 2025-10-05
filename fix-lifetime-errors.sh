#!/bin/bash

echo "🔧 Corrigindo problemas de lifetime..."

# Corrigir todos os problemas de lifetime nos arquivos de comandos
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/state: AppState,/state: AppState<'\''_>,/g' {} \;

# Corrigir problemas com strings no arquivo de pedidos
sed -i 's/chrono::DateTime::parse_from_rfc3339(&s)/chrono::DateTime::parse_from_rfc3339(s.as_str())/g' src-tauri/src/commands/pedido.rs

echo "✅ Correções aplicadas!"







