import logging
import sys

from colorlog import ColoredFormatter
from middlewares.context.request import get_request_id

logger = logging.getLogger("app_logger")
logger.setLevel(logging.DEBUG)

class RequestIDFilter(logging.Filter):

    def filter(self, record):
        record.request_id = get_request_id()
        return True


class ConditionalRequestIDFormatter(ColoredFormatter):

    def format(self, record):

        if record.levelno >= logging.ERROR:
            record.msg = f"[{get_request_id()}] {record.msg}"

        return super().format(record)

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
console_handler.addFilter(RequestIDFilter())

formatter = ConditionalRequestIDFormatter(
    "%(asctime)s %(log_color)s%(levelname)-8s%(reset)s %(white)s%(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    reset=True,
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'red,bg_white'
    },
    secondary_log_colors={},
    style="%"
)

console_handler.setFormatter(formatter)

if not logger.hasHandlers():
    logger.addHandler(console_handler)