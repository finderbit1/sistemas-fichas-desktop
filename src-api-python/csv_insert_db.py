import pandas as pd
import re

# Carregar o CSV
df = pd.read_csv('vendas_e_nf-e_350848340479956.csv', sep=';')

# Filtrar apenas clientes
df_clientes = df[df['Tags'].str.contains('Cliente', na=False)]

# Funções de sanitização
def sanitize_name(name):
    if pd.isna(name):
        return 'N/A'
    name = name.upper()
    name = re.sub(r'[^\w\s-]', '', name)  # Remove caracteres especiais, exceto espaços e hífens
    return ' '.join(name.split())  # Remove espaços extras

def sanitize_cep(cep):
    if pd.isna(cep) or not re.match(r'^\d{8}$', str(cep).replace('-', '')):
        return 'N/A'
    cep = str(cep).replace('-', '').zfill(8)
    return f'{cep[:5]}-{cep[5:]}'

def sanitize_city(city):
    if pd.isna(city):
        return 'N/A'
    city = re.sub(r'\s*\(.*?\)', '', city)  # Remove conteúdo entre parênteses
    city = city.upper()
    return ' '.join(city.split())

def sanitize_state(state):
    if pd.isna(state) or state not in ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']:
        return 'N/A'
    return state.upper()

def sanitize_phone(phone):
    if pd.isna(phone):
        return 'N/A'
    phone = re.sub(r'[^\d]', '', phone)  # Remove tudo exceto dígitos
    if len(phone) == 10 or len(phone) == 11:  # DDD + 8 ou 9 dígitos
        return f'+55{phone}'
    return 'N/A'

# Aplicar sanitização
df_clientes['Nome'] = df_clientes['Razão Social / Nome Completo'].apply(sanitize_name)
df_clientes['CEP'] = df_clientes['CEP'].apply(sanitize_cep)
df_clientes['Cidade'] = df_clientes['Cidade'].apply(sanitize_city)
df_clientes['Estado'] = df_clientes['Estado'].apply(sanitize_state)
df_clientes['Telefone'] = df_clientes['Telefone'].apply(sanitize_phone)

# Selecionar colunas relevantes
df_sanitized = df_clientes[['Nome', 'CEP', 'Cidade', 'Estado', 'Telefone']]

# Salvar em um novo CSV
df_sanitized.to_csv('clientes_sanitizados.csv', index=False, encoding='utf-8')

print("Dados sanitizados salvos em 'clientes_sanitizados.csv'")
