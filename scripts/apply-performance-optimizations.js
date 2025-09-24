#!/usr/bin/env node

/**
 * Script para aplicar otimizações de performance automaticamente
 * Substitui componentes originais pelos otimizados
 */

const fs = require('fs');
const path = require('path');

const OPTIMIZATIONS = [
  {
    name: 'Substituir App.jsx por OptimizedApp.jsx',
    original: 'src/App.jsx',
    optimized: 'src/components/OptimizedApp.jsx',
    backup: 'src/App.jsx.backup'
  },
  {
    name: 'Substituir CreateOrder.jsx por OptimizedCreateOrder.jsx',
    original: 'src/components/CreateOrder.jsx',
    optimized: 'src/components/OptimizedCreateOrder.jsx',
    backup: 'src/components/CreateOrder.jsx.backup'
  },
  {
    name: 'Substituir KanbanBoard.jsx por OptimizedKanbanBoard.jsx',
    original: 'src/components/KanbanBoard.jsx',
    optimized: 'src/components/OptimizedKanbanBoard.jsx',
    backup: 'src/components/KanbanBoard.jsx.backup'
  },
  {
    name: 'Substituir AuthContext.jsx por OptimizedAuthContext.jsx',
    original: 'src/contexts/AuthContext.jsx',
    optimized: 'src/contexts/OptimizedAuthContext.jsx',
    backup: 'src/contexts/AuthContext.jsx.backup'
  }
];

const IMPORTS_TO_UPDATE = [
  {
    file: 'src/pages/PageCreateOrder.jsx',
    oldImport: "import CreateOrder from '../components/CreateOrder';",
    newImport: "import OptimizedCreateOrder from '../components/OptimizedCreateOrder';",
    oldComponent: '<CreateOrder />',
    newComponent: '<OptimizedCreateOrder />'
  },
  {
    file: 'src/pages/PageHome.jsx',
    oldImport: "import KanbanBoard from '../components/KanbanBoard';",
    newImport: "import OptimizedKanbanBoard from '../components/OptimizedKanbanBoard';",
    oldComponent: '<KanbanBoard',
    newComponent: '<OptimizedKanbanBoard'
  }
];

function createBackup(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backup criado: ${backupPath}`);
    return true;
  }
  return false;
}

function replaceFile(originalPath, optimizedPath) {
  if (!fs.existsSync(optimizedPath)) {
    console.log(`❌ Arquivo otimizado não encontrado: ${optimizedPath}`);
    return false;
  }

  if (!fs.existsSync(originalPath)) {
    console.log(`❌ Arquivo original não encontrado: ${originalPath}`);
    return false;
  }

  // Criar backup
  createBackup(originalPath);

  // Substituir arquivo
  fs.copyFileSync(optimizedPath, originalPath);
  console.log(`✅ Arquivo substituído: ${originalPath}`);
  return true;
}

function updateImports(filePath, oldImport, newImport, oldComponent, newComponent) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Atualizar import
  if (content.includes(oldImport)) {
    content = content.replace(oldImport, newImport);
    changed = true;
    console.log(`✅ Import atualizado em ${filePath}`);
  }

  // Atualizar componente
  if (content.includes(oldComponent)) {
    content = content.replace(new RegExp(oldComponent, 'g'), newComponent);
    changed = true;
    console.log(`✅ Componente atualizado em ${filePath}`);
  }

  if (changed) {
    // Criar backup
    createBackup(filePath);
    
    // Salvar arquivo atualizado
    fs.writeFileSync(filePath, content);
    console.log(`✅ Arquivo atualizado: ${filePath}`);
  }

  return changed;
}

function createPerformanceInitFile() {
  const initContent = `// Performance Optimizations Initialization
import performanceOptimizer from './utils/performanceOptimizer';
import { globalCache } from './utils/performanceCache';

// Inicializar otimizações de performance
console.log('🚀 Inicializando otimizações de performance...');

// Configurar cache global
globalCache.api.maxSize = 100;
globalCache.components.maxSize = 200;
globalCache.data.maxSize = 1000;

// Log de métricas a cada 5 minutos
setInterval(() => {
  const metrics = performanceOptimizer.getMetrics();
  console.log('📊 Métricas de Performance:', {
    cacheHits: metrics.cacheStats.api.hitCount,
    cacheMisses: metrics.cacheStats.api.missCount,
    hitRate: metrics.cacheStats.api.hitRate,
    renderTime: metrics.renderTime,
    memoryUsage: metrics.memoryUsage
  });
}, 5 * 60 * 1000);

console.log('✅ Otimizações de performance inicializadas!');
`;

  const initPath = 'src/utils/performanceInit.js';
  fs.writeFileSync(initPath, initContent);
  console.log(`✅ Arquivo de inicialização criado: ${initPath}`);
}

function updateMainJsx() {
  const mainJsxPath = 'src/main.jsx';
  
  if (!fs.existsSync(mainJsxPath)) {
    console.log(`❌ Arquivo main.jsx não encontrado: ${mainJsxPath}`);
    return false;
  }

  let content = fs.readFileSync(mainJsxPath, 'utf8');
  
  // Verificar se já tem a importação
  if (content.includes('performanceInit')) {
    console.log(`✅ main.jsx já atualizado`);
    return true;
  }

  // Criar backup
  createBackup(mainJsxPath);

  // Adicionar importação no início
  const importLine = "import './utils/performanceInit';";
  const lines = content.split('\n');
  
  // Encontrar onde inserir (após outras importações)
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') && !lines[i].includes('performanceInit')) {
      insertIndex = i + 1;
    }
  }

  lines.splice(insertIndex, 0, importLine);
  
  fs.writeFileSync(mainJsxPath, lines.join('\n'));
  console.log(`✅ main.jsx atualizado com inicialização de performance`);
  
  return true;
}

function createPackageJsonScripts() {
  const packageJsonPath = 'package.json';
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ package.json não encontrado`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Adicionar scripts de performance
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['performance:analyze'] = 'npm run build && npx webpack-bundle-analyzer dist/assets/*.js';
  packageJson.scripts['performance:profile'] = 'npm start -- --profile';
  packageJson.scripts['performance:optimize'] = 'node scripts/apply-performance-optimizations.js';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Scripts de performance adicionados ao package.json`);
}

function main() {
  console.log('🚀 Aplicando otimizações de performance...\n');

  let successCount = 0;
  let totalCount = 0;

  // Aplicar substituições de arquivos
  console.log('📁 Substituindo componentes por versões otimizadas:');
  OPTIMIZATIONS.forEach(optimization => {
    totalCount++;
    console.log(`\n🔄 ${optimization.name}`);
    
    if (replaceFile(optimization.original, optimization.optimized)) {
      successCount++;
    }
  });

  // Atualizar imports
  console.log('\n📝 Atualizando imports:');
  IMPORTS_TO_UPDATE.forEach(update => {
    totalCount++;
    console.log(`\n🔄 Atualizando ${update.file}`);
    
    if (updateImports(update.file, update.oldImport, update.newImport, update.oldComponent, update.newComponent)) {
      successCount++;
    }
  });

  // Criar arquivo de inicialização
  console.log('\n⚙️ Configurando inicialização:');
  totalCount++;
  try {
    createPerformanceInitFile();
    successCount++;
  } catch (error) {
    console.log(`❌ Erro ao criar arquivo de inicialização: ${error.message}`);
  }

  // Atualizar main.jsx
  totalCount++;
  try {
    if (updateMainJsx()) {
      successCount++;
    }
  } catch (error) {
    console.log(`❌ Erro ao atualizar main.jsx: ${error.message}`);
  }

  // Atualizar package.json
  totalCount++;
  try {
    createPackageJsonScripts();
    successCount++;
  } catch (error) {
    console.log(`❌ Erro ao atualizar package.json: ${error.message}`);
  }

  // Resultado final
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resultado: ${successCount}/${totalCount} otimizações aplicadas`);
  
  if (successCount === totalCount) {
    console.log('🎉 Todas as otimizações foram aplicadas com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: npm install');
    console.log('2. Execute: npm run dev');
    console.log('3. Verifique as métricas de performance no console');
    console.log('4. Use React DevTools Profiler para monitorar melhorias');
  } else {
    console.log('⚠️ Algumas otimizações falharam. Verifique os erros acima.');
  }

  console.log('\n📚 Documentação completa: OTIMIZACOES_PERFORMANCE.md');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, replaceFile, updateImports };
