#!/bin/bash

echo "🔧 Corrigindo todos os problemas restantes..."

# Corrigir problemas de lifetime restantes
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/pub async fn \([^(]*\)(state: AppState)/pub async fn \1(state: AppState<'\''_>)/g' {} \;

# Corrigir problemas de tipo usize -> i64
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/id: Some(id)/id: Some(id as i64)/g' {} \;

# Remover mut desnecessário
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/let mut db = state.get_connection/let db = state.get_connection/g' {} \;

echo "✅ Todas as correções aplicadas!"





