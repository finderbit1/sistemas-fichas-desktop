"""
Script para popular materiais iniciais no banco de dados

Execução:
    python popular_materiais.py
"""

from sqlmodel import Session, select
from database.database import engine, create_db_and_tables
from materiais.schema import Material


def popular_materiais():
    """Popula a tabela de materiais com dados iniciais"""
    
    # Criar tabelas se não existirem
    create_db_and_tables()
    
    materiais_iniciais = [
        # Materiais para TOTEM
        Material(name="MDF 6mm", description="MDF de 6mm de espessura", tipo_producao="totem", active=True),
        Material(name="MDF 3mm", description="MDF de 3mm de espessura", tipo_producao="totem", active=True),
        Material(name="Poliondas", description="Placa de poliondas", tipo_producao="totem", active=True),
        Material(name="PVC", description="Placa de PVC", tipo_producao="totem", active=True),
        
        # Materiais para LONA
        Material(name="Lona 280g", description="Lona 280g/m²", tipo_producao="lona", active=True),
        Material(name="Lona 340g", description="Lona 340g/m²", tipo_producao="lona", active=True),
        Material(name="Lona 440g", description="Lona 440g/m²", tipo_producao="lona", active=True),
        Material(name="Lona 520g", description="Lona 520g/m²", tipo_producao="lona", active=True),
    ]
    
    with Session(engine) as session:
        # Verificar quais materiais já existem
        for material_data in materiais_iniciais:
            # Buscar se já existe
            exists = session.exec(
                select(Material).where(
                    Material.name == material_data.name,
                    Material.tipo_producao == material_data.tipo_producao
                )
            ).first()
            
            if not exists:
                session.add(material_data)
                print(f"✅ Material criado: {material_data.name} ({material_data.tipo_producao})")
            else:
                print(f"⏭️  Material já existe: {material_data.name} ({material_data.tipo_producao})")
        
        session.commit()
    
    print("\n🎉 Materiais populados com sucesso!")
    print("\nMateriais disponíveis:")
    
    with Session(engine) as session:
        # Listar todos os materiais
        materiais = session.exec(select(Material)).all()
        
        # Agrupar por tipo
        por_tipo = {}
        for m in materiais:
            if m.tipo_producao not in por_tipo:
                por_tipo[m.tipo_producao] = []
            por_tipo[m.tipo_producao].append(m.name)
        
        for tipo, lista in sorted(por_tipo.items()):
            print(f"\n{tipo.upper()}:")
            for nome in lista:
                print(f"  - {nome}")


if __name__ == "__main__":
    print("🚀 Populando materiais iniciais...\n")
    popular_materiais()


