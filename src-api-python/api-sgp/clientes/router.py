from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select
from base import get_session
from .schema import Cliente, ClienteCreate, ClienteUpdate
import csv
import io
from typing import List

router = APIRouter(prefix='/clientes', tags=["Clientes"])

@router.post("/", response_model=Cliente)
def create_cliente(cliente: ClienteCreate, session: Session = Depends(get_session)):
    db_cliente = Cliente(**cliente.model_dump())
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    return db_cliente

@router.get("/", response_model=list[Cliente])
def read_clientes(session: Session = Depends(get_session)):
    clientes = session.exec(select(Cliente)).all()
    return clientes

@router.get("/{cliente_id}", response_model=Cliente)
def read_cliente(cliente_id: int, session: Session = Depends(get_session)):
    cliente = session.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@router.patch("/{cliente_id}", response_model=Cliente)
def update_cliente(cliente_id: int, cliente_update: ClienteUpdate, session: Session = Depends(get_session)):
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    cliente_data = cliente_update.model_dump(exclude_unset=True)
    for field, value in cliente_data.items():
        setattr(db_cliente, field, value)
    
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    return db_cliente

@router.delete("/{cliente_id}")
def delete_cliente(cliente_id: int, session: Session = Depends(get_session)):
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    session.delete(db_cliente)
    session.commit()
    return {"message": "Cliente deletado com sucesso"}

@router.post("/import-csv")
def import_clientes_csv(file: UploadFile = File(...), session: Session = Depends(get_session)):
    """
    Importa clientes de um arquivo CSV.
    
    O CSV deve ter as seguintes colunas (em qualquer ordem):
    - nome
    - cep
    - cidade
    - estado
    - telefone
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Arquivo deve ser um CSV")
    
    try:
        # Ler o conteúdo do arquivo
        content = file.file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content))
        
        clientes_criados = []
        erros = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Começa em 2 porque linha 1 é cabeçalho
            try:
                # Validar campos obrigatórios
                required_fields = ['nome', 'cep', 'cidade', 'estado', 'telefone']
                missing_fields = [field for field in required_fields if not row.get(field, '').strip()]
                
                if missing_fields:
                    erros.append(f"Linha {row_num}: Campos obrigatórios ausentes: {', '.join(missing_fields)}")
                    continue
                
                # Criar cliente
                cliente_data = {
                    'nome': row['nome'].strip(),
                    'cep': row['cep'].strip(),
                    'cidade': row['cidade'].strip(),
                    'estado': row['estado'].strip(),
                    'telefone': row['telefone'].strip()
                }
                
                # Verificar se cliente já existe (por nome e telefone)
                existing_cliente = session.exec(
                    select(Cliente).where(
                        Cliente.nome == cliente_data['nome'],
                        Cliente.telefone == cliente_data['telefone']
                    )
                ).first()
                
                if existing_cliente:
                    erros.append(f"Linha {row_num}: Cliente já existe (nome: {cliente_data['nome']}, telefone: {cliente_data['telefone']})")
                    continue
                
                # Criar novo cliente
                db_cliente = Cliente(**cliente_data)
                session.add(db_cliente)
                session.commit()
                session.refresh(db_cliente)
                clientes_criados.append(db_cliente)
                
            except Exception as e:
                erros.append(f"Linha {row_num}: Erro ao processar - {str(e)}")
                continue
        
        return {
            "message": f"Importação concluída. {len(clientes_criados)} clientes criados.",
            "clientes_criados": len(clientes_criados),
            "erros": erros,
            "total_linhas_processadas": row_num - 1
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar arquivo CSV: {str(e)}")