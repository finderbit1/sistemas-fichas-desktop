import pandas as pd

def filtrar_dados_csv(entrada, saida):
    # Carregar o CSV original
    df = pd.read_csv(entrada, sep=None, engine="python")

    # Selecionar e renomear as colunas necessárias
    df_filtrado = df[[
        "Razão Social / Nome Completo",
        "CEP",
        "Cidade",
        "Estado",
        "Telefone"
    ]].rename(columns={
        "Razão Social / Nome Completo": "nome",
        "CEP": "cep",
        "Cidade": "cidade",
        "Estado": "estado",
        "Telefone": "telefone"
    })

    # Remover registros sem CEP
    df_filtrado = df_filtrado.dropna(subset=["cep"])

    # Salvar em novo CSV
    df_filtrado.to_csv(saida, index=False, encoding="utf-8")
    print(f"Arquivo gerado com sucesso: {saida}")


if __name__ == "__main__":
    # Caminho do arquivo original (mude para onde está o seu CSV)
    arquivo_entrada = "vendas_e_nf-e_350848340479956.csv"
    
    # Nome do novo arquivo
    arquivo_saida = "dados_filtrados.csv"
    
    # Executa a filtragem
    filtrar_dados_csv(arquivo_entrada, arquivo_saida)

