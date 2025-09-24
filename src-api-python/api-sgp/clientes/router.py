from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select
from base import get_session
from .schema import Cliente, ClienteCreate, ClienteUpdate
from cache_manager import cache_manager, ClienteCache
from pagination import PaginationParams, PaginatedResponse, paginate_clientes
import csv
import io
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/clientes', tags=["Clientes"])

@router.post("/", response_model=Cliente)
def create_cliente(cliente: ClienteCreate, session: Session = Depends(get_session)):
    """Cria novo cliente e invalida cache"""
    db_cliente = Cliente(**cliente.model_dump())
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    
    # Invalidar cache de clientes
    ClienteCache.invalidate_all()
    logger.info("🗑️ Cache de clientes invalidado após criação")
    
    return db_cliente

@router.get("/", response_model=list[Cliente])
def read_clientes(session: Session = Depends(get_session)):
    """Lista todos os clientes com cache (endpoint legado)"""
    # Tentar obter do cache primeiro
    cache_key = ClienteCache.get_all_key()
    cached_clientes = cache_manager.get(cache_key)
    
    if cached_clientes is not None:
        logger.info("🎯 Cache hit: clientes")
        return cached_clientes
    
    # Se não estiver no cache, buscar no banco
    logger.info("🔄 Cache miss: clientes - buscando no banco")
    clientes = session.exec(select(Cliente)).all()
    
    # Converter para dict para cache
    clientes_dict = [cliente.model_dump() for cliente in clientes]
    
    # Cachear por 5 minutos
    cache_manager.set(cache_key, clientes_dict, ttl=300)
    
    return clientes

@router.get("/paginated", response_model=PaginatedResponse[Cliente])
def read_clientes_paginated(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(50, ge=1, le=1000, description="Tamanho da página"),
    session: Session = Depends(get_session)
):
    """Lista clientes com paginação"""
    pagination = PaginationParams(page=page, size=size)
    
    # Tentar obter do cache primeiro
    cache_key = f"{ClienteCache.get_all_key()}:paginated:{page}:{size}"
    cached_result = cache_manager.get(cache_key)
    
    if cached_result is not None:
        logger.info(f"🎯 Cache hit: clientes paginados (página {page})")
        return PaginatedResponse(**cached_result)
    
    # Se não estiver no cache, buscar no banco
    logger.info(f"🔄 Cache miss: clientes paginados (página {page}) - buscando no banco")
    result = paginate_clientes(session, pagination)
    
    # Cachear por 2 minutos (paginação tem cache mais curto)
    cache_manager.set(cache_key, result.model_dump(), ttl=120)
    
    return result

@router.get("/{cliente_id}", response_model=Cliente)
def read_cliente(cliente_id: int, session: Session = Depends(get_session)):
    """Obtém cliente por ID com cache"""
    # Tentar obter do cache primeiro
    cache_key = ClienteCache.get_by_id_key(cliente_id)
    cached_cliente = cache_manager.get(cache_key)
    
    if cached_cliente is not None:
        logger.info(f"🎯 Cache hit: cliente {cliente_id}")
        return Cliente(**cached_cliente)
    
    # Se não estiver no cache, buscar no banco
    logger.info(f"🔄 Cache miss: cliente {cliente_id} - buscando no banco")
    cliente = session.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Cachear por 10 minutos
    cache_manager.set(cache_key, cliente.model_dump(), ttl=600)
    
    return cliente

@router.patch("/{cliente_id}", response_model=Cliente)
def update_cliente(cliente_id: int, cliente_update: ClienteUpdate, session: Session = Depends(get_session)):
    """Atualiza cliente e invalida cache"""
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    cliente_data = cliente_update.model_dump(exclude_unset=True)
    for field, value in cliente_data.items():
        setattr(db_cliente, field, value)
    
    session.add(db_cliente)
    session.commit()
    session.refresh(db_cliente)
    
    # Invalidar cache de clientes
    ClienteCache.invalidate_all()
    logger.info(f"🗑️ Cache de clientes invalidado após atualização do cliente {cliente_id}")
    
    return db_cliente

@router.delete("/{cliente_id}")
def delete_cliente(cliente_id: int, session: Session = Depends(get_session)):
    """Deleta cliente e invalida cache"""
    db_cliente = session.get(Cliente, cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    session.delete(db_cliente)
    session.commit()
    
    # Invalidar cache de clientes
    ClienteCache.invalidate_all()
    logger.info(f"🗑️ Cache de clientes invalidado após deleção do cliente {cliente_id}")
    
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