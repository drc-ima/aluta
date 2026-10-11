import os

from sqlalchemy import create_engine

from middlewares.logging.logger import logger


def postgres_engine():

    try:
        db_params = {
            "server": os.getenv("DB_SERVER"),
            "database": os.getenv("DB_NAME"),
            "user": os.getenv("DB_USERNAME"),
            "password": os.getenv("DB_PASSWORD")
        }

        connection = f"postgresql+psycopg2://{db_params['user']}:{db_params['password']}@{db_params['server']}/{db_params['database']}"

        engine = create_engine(connection)

        return engine
        # @event.listens_for(engine, "do_connect")
        # def receive_do_connect(dialect, conn_rec, cargs, cparams):
        #     to
    except Exception as e:
        logger.error(
            f"Error whiles initializing Database: {e}"
        )
        raise e