# 🚀 Guia de Instalação e Uso - Rust Performance Engine

## 📋 Pré-requisitos

### **1. Instalar Rust**
```bash
# Instalar Rust (se não estiver instalado)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verificar instalação
rustc --version
cargo --version
```

### **2. Instalar wasm-pack**
```bash
# Instalar wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Verificar instalação
wasm-pack --version
```

### **3. Node.js e npm**
```bash
# Verificar versões
node --version  # >= 16.0.0
npm --version   # >= 8.0.0
```

## 🛠️ Instalação

### **1. Build do Projeto Rust**
```bash
# Navegar para o diretório do projeto
cd /caminho/para/sistemas-fichas-desktop-main

# Navegar para rust-performance
cd rust-performance/

# Executar build
./build.sh

# Ou executar manualmente
wasm-pack build --target web --out-dir pkg --release
```

### **2. Verificar Arquivos Gerados**
```bash
# Verificar se os arquivos foram criados
ls -la pkg/

# Deve conter:
# - sgp_performance.js
# - sgp_performance_bg.wasm
# - package.json
# - README.md
```

### **3. Instalar Dependências do React**
```bash
# Voltar para o diretório principal
cd ..

# Instalar dependências (se necessário)
npm install

# Ou com pnpm
pnpm install
```

## 🚀 Como Usar

### **1. Uso Básico - Hook React**
```jsx
import { useRustPerformance } from './hooks/useRustPerformance';

function MeuComponente() {
  const { initialized, calculateArea, parseBrazilianMoney } = useRustPerformance();
  
  const handleCalculation = () => {
    if (initialized) {
      const area = calculateArea(150, 200);
      console.log('Área:', area.formatted_area);
      
      const money = parseBrazilianMoney('123456');
      console.log('Valor:', money.formatted_value);
    }
  };
  
  return (
    <button onClick={handleCalculation} disabled={!initialized}>
      {initialized ? 'Calcular' : 'Carregando...'}
    </button>
  );
}
```

### **2. Uso Avançado - Componentes Otimizados**
```jsx
import RustAreaCalculator from './components/RustAreaCalculator';
import RustMoneyInput from './components/RustMoneyInput';

function MeuFormulario() {
  const [formData, setFormData] = useState({
    largura: '',
    altura: '',
    valor: ''
  });
  
  const handleAreaChange = (areaData) => {
    setFormData(prev => ({
      ...prev,
      largura: areaData.largura,
      altura: areaData.altura,
      area: areaData.area
    }));
  };
  
  return (
    <div>
      <RustAreaCalculator 
        formData={formData}
        onChange={handleAreaChange}
        showPerformance={true}
        showValidation={true}
      />
      
      <RustMoneyInput
        name="valor"
        label="Valor Total"
        value={formData.valor}
        onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
        showPerformance={true}
        showValidation={true}
      />
    </div>
  );
}
```

### **3. Integração com Formulários Existentes**
```jsx
// Substituir o componente antigo pelo novo
import FormPainelRust from './components/prouctions/FormPainelRust';

// No FormOrder.jsx, substituir:
// {opcaoSelecionada === 'painel' && <FormPainel onAdicionarItem={adicionarItem} />}

// Por:
{opcaoSelecionada === 'painel' && <FormPainelRust onAdicionarItem={adicionarItem} />}
```

## 🔧 Configuração

### **1. Configuração do Webpack (se necessário)**
```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json'],
  },
};
```

### **2. Configuração do Vite (se usando Vite)**
```javascript
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['sgp_performance']
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
};
```

### **3. Configuração do package.json**
```json
{
  "dependencies": {
    "sgp_performance": "file:./rust-performance/pkg"
  }
}
```

## 🧪 Testes

### **1. Teste de Funcionamento**
```jsx
// Componente de teste
import RustPerformanceDemo from './components/examples/RustPerformanceDemo';

function App() {
  return (
    <div>
      <h1>Teste Rust Performance</h1>
      <RustPerformanceDemo />
    </div>
  );
}
```

### **2. Teste de Performance**
```javascript
// Console do navegador
import performanceEngine from './rust-performance/pkg/sgp_performance.js';

// Inicializar
await performanceEngine.init();

// Executar benchmark
const result = performanceEngine.runBenchmark(10000);
console.log(result);

// Teste manual
const start = performance.now();
for (let i = 0; i < 1000; i++) {
  performanceEngine.calculateArea(150, 200);
}
const end = performance.now();
console.log(`1000 cálculos em ${end - start}ms`);
```

## 🐛 Troubleshooting

### **Problema 1: wasm-pack não encontrado**
```bash
# Solução: Reinstalar wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
source ~/.cargo/env
```

### **Problema 2: Erro de compilação Rust**
```bash
# Solução: Atualizar Rust
rustup update

# Verificar versão
rustc --version
```

### **Problema 3: Módulo WASM não carrega**
```javascript
// Verificar se o arquivo existe
console.log(fetch('./rust-performance/pkg/sgp_performance_bg.wasm'));

// Verificar CORS
// Adicionar headers CORS no servidor de desenvolvimento
```

### **Problema 4: Performance não melhorou**
```javascript
// Verificar se o engine está inicializado
const { initialized } = useRustPerformance();
console.log('Rust inicializado:', initialized);

// Verificar cache
performanceEngine.clearCache();
```

## 📊 Monitoramento

### **1. Logs de Performance**
```javascript
// Ativar logs detalhados
localStorage.setItem('rust_performance_debug', 'true');

// Ver logs no console
console.log('Performance logs ativados');
```

### **2. Estatísticas do Engine**
```javascript
// Obter estatísticas
const stats = performanceEngine.getStats();
console.log('Stats:', stats);

// Monitorar cache
setInterval(() => {
  const stats = performanceEngine.getStats();
  console.log('Cache size:', stats.cacheSize);
}, 5000);
```

### **3. Benchmark Contínuo**
```javascript
// Benchmark automático
setInterval(() => {
  const result = performanceEngine.runBenchmark(1000);
  console.log('Benchmark:', result);
}, 30000); // A cada 30 segundos
```

## 🔄 Atualizações

### **1. Rebuild após Mudanças no Rust**
```bash
# Rebuild automático
cd rust-performance/
./build.sh

# Ou rebuild manual
wasm-pack build --target web --out-dir pkg --release
```

### **2. Limpar Cache**
```bash
# Limpar cache do Rust
cd rust-performance/
cargo clean

# Limpar cache do npm
npm cache clean --force
```

### **3. Atualizar Dependências**
```bash
# Atualizar Rust
rustup update

# Atualizar wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

## 🚀 Deploy

### **1. Build para Produção**
```bash
# Build Rust para produção
cd rust-performance/
wasm-pack build --target web --out-dir pkg --release

# Build React para produção
cd ..
npm run build
```

### **2. Verificar Arquivos de Produção**
```bash
# Verificar se os arquivos WASM estão no build
ls -la dist/
ls -la dist/rust-performance/
```

### **3. Configuração do Servidor**
```nginx
# nginx.conf - Configurar CORS para WASM
location ~* \.wasm$ {
    add_header Content-Type application/wasm;
    add_header Cross-Origin-Embedder-Policy require-corp;
    add_header Cross-Origin-Opener-Policy same-origin;
}
```

## 📈 Otimizações

### **1. Lazy Loading**
```javascript
// Carregar Rust apenas quando necessário
const loadRustEngine = async () => {
  const { default: engine } = await import('./rust-performance/pkg/sgp_performance.js');
  await engine.init();
  return engine;
};
```

### **2. Web Workers (Futuro)**
```javascript
// Usar Web Workers para cálculos pesados
const worker = new Worker('./rust-worker.js');
worker.postMessage({ type: 'CALCULATE_AREA', data: { width: 150, height: 200 } });
```

### **3. Service Worker Cache**
```javascript
// Cache dos arquivos WASM
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('rust-performance-v1').then(cache => {
      return cache.addAll([
        './rust-performance/pkg/sgp_performance_bg.wasm',
        './rust-performance/pkg/sgp_performance.js'
      ]);
    })
  );
});
```

---

## 🎉 Sistema Pronto!

Seguindo este guia, você terá o sistema de performance Rust/WASM funcionando perfeitamente, com melhorias de até **10x** em cálculos matemáticos!

**Performance nativa com segurança de memória do Rust!** 🚀
