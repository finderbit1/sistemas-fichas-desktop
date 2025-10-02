#!/bin/bash

echo "🔧 Corrigindo erros de compilação Rust..."

# Corrigir problemas de lifetime em todos os arquivos de comandos
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/type AppState = State<'\''_, Database>;/type AppState<'a> = State<'a, Database>;/g' {} \;

# Corrigir problemas com strings em todos os arquivos
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/chrono::DateTime::parse_from_rfc3339(&s)/chrono::DateTime::parse_from_rfc3339(s.as_str())/g' {} \;

echo "✅ Correções aplicadas!"


