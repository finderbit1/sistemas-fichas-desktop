# from database.database import engine
# # from database import engine
# from sqlalchemy import Column, Integer, String, Numeric
# from sqlalchemy.orm import declarative_base

# Base = declarative_base()

# class ClienteDB(Base):
#     __tablename__ = "clientes"
#     id = Column(Integer, primary_key=True, index=True)
#     nome = Column(String, nullable=False)
#     cep = Column(String, nullable=False)
#     cidade = Column(String, nullable=False)
#     estado = Column(String, nullable=False)
#     telefone = Column(String, nullable=False)


# class EnvioDB(Base):
#     __tablename__ = "envios"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     value = Column(Numeric(10, 2), nullable=True)


# class PaymentsDB(Base):
#     __tablename__ = "payments"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)


# class UserDB(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     email = Column(String, nullable=False, unique=True)


# class VendedorDB(Base):
#     __tablename__ = "vendedores"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)


# class DesignerDB(Base):
#     __tablename__ = "designers"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)

# def init_db():
#     # ClienteDB.metadata.create_all(bind=engine)
#     EnvioDB.metadata.create_all(bind=engine)
#     PaymentsDB.metadata.create_all(bind=engine)
#     UserDB.metadata.create_all(bind=engine)
#     VendedorDB.metadata.create_all(bind=engine)
#     DesignerDB.metadata.create_all(bind=engine)

# if __name__ == "__main__":
#     init_db()
