#!/bin/bash

# 🌐 ASSISTENTE DE CONFIGURAÇÃO DE REDE
# Script para ajudar na configuração do sistema em múltiplos computadores

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
clear
echo "=================================================="
echo -e "${CYAN}🌐 ASSISTENTE DE CONFIGURAÇÃO DE REDE${NC}"
echo "=================================================="
echo ""

# Detectar IP da rede
echo -e "${BLUE}📡 Detectando IP da rede...${NC}"
echo ""

# Pegar IP principal (ignora Docker e localhost)
NETWORK_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | grep -v "172\." | awk '{print $2}' | cut -d/ -f1 | head -n1)

if [ -z "$NETWORK_IP" ]; then
    echo -e "${YELLOW}⚠️  Não foi possível detectar o IP automaticamente${NC}"
    echo -n "Digite o IP do servidor manualmente: "
    read NETWORK_IP
fi

echo -e "${GREEN}✅ IP detectado: ${NETWORK_IP}${NC}"
echo ""

# Verificar se a API está rodando
API_PORT=8000
API_URL="http://${NETWORK_IP}:${API_PORT}"

echo -e "${BLUE}🔍 Verificando se a API está rodando...${NC}"

if curl -s "${API_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API está funcionando em ${API_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  API não está respondendo em ${API_URL}${NC}"
    echo ""
    echo -e "${CYAN}💡 Dica: Inicie a API com:${NC}"
    echo "   cd src-api-python/api-sgp"
    echo "   ./start.sh"
    echo ""
    read -p "Pressione Enter para continuar mesmo assim..."
fi

echo ""
echo "=================================================="
echo -e "${CYAN}📋 INSTRUÇÕES PARA OS COMPUTADORES CLIENTES${NC}"
echo "=================================================="
echo ""

# Instruções para configuração manual
echo -e "${YELLOW}1. Configure via Interface Gráfica:${NC}"
echo "   • Abra o sistema no navegador"
echo "   • Vá em: Admin > Configurações do Sistema"
echo "   • No campo 'URL do Servidor', digite:"
echo -e "     ${GREEN}${API_URL}${NC}"
echo "   • Clique em 'Testar Conexão'"
echo "   • Clique em 'Salvar Configuração'"
echo ""

echo -e "${YELLOW}2. Ou configure via Console do Navegador:${NC}"
echo "   • Pressione F12 no navegador"
echo "   • Vá na aba 'Console'"
echo "   • Cole e execute o seguinte código:"
echo ""
echo -e "${CYAN}localStorage.setItem('serverConfig', JSON.stringify({${NC}"
echo -e "${CYAN}  baseURL: '${API_URL}',${NC}"
echo -e "${CYAN}  timeout: 10000,${NC}"
echo -e "${CYAN}  retries: 3${NC}"
echo -e "${CYAN}}));${NC}"
echo -e "${CYAN}location.reload();${NC}"
echo ""

# Gerar QR Code se disponível
if command -v qrencode &> /dev/null; then
    echo "=================================================="
    echo -e "${CYAN}📱 QR CODE PARA CONFIGURAÇÃO${NC}"
    echo "=================================================="
    echo ""
    
    CONFIG_JSON="{\"baseURL\":\"${API_URL}\",\"timeout\":10000,\"retries\":3}"
    CONFIG_CMD="localStorage.setItem('serverConfig',JSON.stringify(${CONFIG_JSON}));location.reload();"
    
    echo "$CONFIG_CMD" | qrencode -t UTF8
    echo ""
    echo "Escaneie este QR code e cole no console do navegador"
    echo ""
fi

echo "=================================================="
echo -e "${CYAN}🔥 INFORMAÇÕES DO FIREWALL${NC}"
echo "=================================================="
echo ""

# Verificar firewall
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -i "Status:" | awk '{print $2}')
    
    if [ "$UFW_STATUS" = "active" ]; then
        echo -e "${BLUE}Firewall UFW está ativo${NC}"
        
        # Verificar se a porta está aberta
        if sudo ufw status | grep -q "${API_PORT}"; then
            echo -e "${GREEN}✅ Porta ${API_PORT} está aberta${NC}"
        else
            echo -e "${YELLOW}⚠️  Porta ${API_PORT} não está aberta${NC}"
            echo ""
            echo -e "${CYAN}Execute para abrir a porta:${NC}"
            echo "   sudo ufw allow ${API_PORT}"
        fi
    else
        echo -e "${GREEN}✅ Firewall UFW está inativo${NC}"
    fi
else
    echo -e "${BLUE}UFW não instalado${NC}"
fi

echo ""
echo "=================================================="
echo -e "${CYAN}🧪 TESTAR CONEXÃO DE OUTRO COMPUTADOR${NC}"
echo "=================================================="
echo ""
echo "Execute este comando em outro computador na mesma rede:"
echo ""
echo -e "${CYAN}curl ${API_URL}/health${NC}"
echo ""
echo "Se funcionar, você verá algo como:"
echo -e "${GREEN}{\"status\":\"healthy\",\"version\":\"1.0.0\"}${NC}"
echo ""

echo "=================================================="
echo -e "${CYAN}📝 RESUMO DA CONFIGURAÇÃO${NC}"
echo "=================================================="
echo ""
echo -e "${GREEN}IP do Servidor:${NC} ${NETWORK_IP}"
echo -e "${GREEN}Porta da API:${NC} ${API_PORT}"
echo -e "${GREEN}URL Completa:${NC} ${API_URL}"
echo -e "${GREEN}Health Check:${NC} ${API_URL}/health"
echo -e "${GREEN}Documentação:${NC} ${API_URL}/docs"
echo ""

# Salvar configuração em arquivo
CONFIG_FILE="network-config.txt"
cat > "$CONFIG_FILE" << EOF
# CONFIGURAÇÃO DE REDE - SISTEMA DE FICHAS
# Gerado em: $(date)

## Informações do Servidor
IP do Servidor: ${NETWORK_IP}
Porta da API: ${API_PORT}
URL da API: ${API_URL}

## URLs Importantes
Health Check: ${API_URL}/health
Documentação: ${API_URL}/docs

## Configuração para o Frontend (localStorage)
localStorage.setItem('serverConfig', JSON.stringify({
  baseURL: '${API_URL}',
  timeout: 10000,
  retries: 3
}));
location.reload();

## Teste de Conexão
curl ${API_URL}/health

## Firewall (se necessário)
sudo ufw allow ${API_PORT}

EOF

echo -e "${GREEN}✅ Configuração salva em: ${CONFIG_FILE}${NC}"
echo ""

# Menu de opções
while true; do
    echo "=================================================="
    echo -e "${CYAN}⚙️  OPÇÕES${NC}"
    echo "=================================================="
    echo "1) 🔄 Recarregar informações"
    echo "2) 🧪 Testar API agora"
    echo "3) 🔥 Abrir porta no firewall"
    echo "4) 📋 Mostrar configuração novamente"
    echo "5) 🚪 Sair"
    echo ""
    echo -n "Escolha uma opção (1-5): "
    read choice
    
    case $choice in
        1)
            exec "$0"
            ;;
        2)
            echo ""
            echo -e "${BLUE}Testando API...${NC}"
            curl -s "${API_URL}/health" | python3 -m json.tool 2>/dev/null || curl -s "${API_URL}/health"
            echo ""
            ;;
        3)
            echo ""
            echo -e "${BLUE}Abrindo porta ${API_PORT} no firewall...${NC}"
            sudo ufw allow ${API_PORT}
            echo ""
            ;;
        4)
            echo ""
            cat "$CONFIG_FILE"
            echo ""
            ;;
        5)
            echo ""
            echo -e "${GREEN}👋 Até logo!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${YELLOW}Opção inválida!${NC}"
            ;;
    esac
    
    echo ""
    read -p "Pressione Enter para continuar..."
    clear
done

