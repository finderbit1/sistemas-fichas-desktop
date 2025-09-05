from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from base import get_session
from .schema import Payments, PaymentsCreate, PaymentsUpdate

router = APIRouter(prefix="/pagamentos", tags=["pagamentos"])

@router.post("/", response_model=Payments)
def create_payment(payment: PaymentsCreate, session: Session = Depends(get_session)):
    db_payment = Payments(**payment.model_dump())
    session.add(db_payment)
    session.commit()
    session.refresh(db_payment)
    return db_payment

@router.get("/", response_model=list[Payments])
def list_payments(session: Session = Depends(get_session)):
    payments = session.exec(select(Payments)).all()
    return payments

@router.get("/{payment_id}", response_model=Payments)
def get_payment(payment_id: int, session: Session = Depends(get_session)):
    payment = session.get(Payments, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Tipo de pagamento não encontrado")
    return payment

@router.patch("/{payment_id}", response_model=Payments)
def update_payment(payment_id: int, payment_update: PaymentsUpdate, session: Session = Depends(get_session)):
    db_payment = session.get(Payments, payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Tipo de pagamento não encontrado")
    
    payment_data = payment_update.model_dump(exclude_unset=True)
    for field, value in payment_data.items():
        setattr(db_payment, field, value)
    
    session.add(db_payment)
    session.commit()
    session.refresh(db_payment)
    return db_payment

@router.delete("/{payment_id}")
def delete_payment(payment_id: int, session: Session = Depends(get_session)):
    db_payment = session.get(Payments, payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Tipo de pagamento não encontrado")
    
    session.delete(db_payment)
    session.commit()
    return {"message": "Tipo de pagamento deletado com sucesso"}
