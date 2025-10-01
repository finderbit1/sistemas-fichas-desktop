#!/bin/bash

echo "🧹 Limpando imports não utilizados..."

# 1. Remover imports não utilizados do relatorio.rs
sed -i '2s/use chrono::{DateTime, Utc};/\/\/ use chrono::{DateTime, Utc}; \/\/ Removido: não utilizado/' src-tauri/src/models/relatorio.rs

# 2. Limpar models/mod.rs - remover todos os pub use
cat > src-tauri/src/models/mod.rs << 'EOF'
pub mod cliente;
pub mod pedido;
pub mod pagamento;
pub mod envio;
pub mod desconto;
pub mod producao;
pub mod tecido;
pub mod designer;
pub mod vendedor;
pub mod relatorio;

// Imports específicos serão adicionados conforme necessário
EOF

# 3. Limpar commands/mod.rs - remover todos os pub use
cat > src-tauri/src/commands/mod.rs << 'EOF'
pub mod cliente;
pub mod pedido;
pub mod pagamento;
pub mod envio;
pub mod desconto;
pub mod producao;
pub mod tecido;
pub mod designer;
pub mod vendedor;
pub mod relatorio;

// Imports específicos serão adicionados conforme necessário
EOF

# 4. Remover imports Update não utilizados dos comandos
find src-tauri/src/commands -name "*.rs" -exec sed -i 's/, [A-Za-z]*Update//g' {} \;

# 5. Corrigir lifetime no database/mod.rs
sed -i "s/std::sync::MutexGuard<Connection>/std::sync::MutexGuard<'_, Connection>/g" src-tauri/src/database/mod.rs

echo "✅ Imports limpos!"
echo "🔧 Compilando para verificar..."

