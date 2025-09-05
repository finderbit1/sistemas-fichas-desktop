from init_db import ClienteDB

from database.database import get_db



def get_all_clientes():
    return get_db.query(ClienteDB).all()