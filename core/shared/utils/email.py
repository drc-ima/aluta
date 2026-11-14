
import os
from pathlib import Path
import sys
import threading
from uuid import uuid4
from datetime import datetime

from shared.utils.message import EmailMessage

class FileEmail:
    def __init__(self, directory: Path, **kwargs):
        self.directory = directory

        self.stream = None
        self._lock = threading.RLock()

    def write_message(self, message: EmailMessage):
        self.stream.write(message.message().as_bytes() + b"\n")
        self.stream.write(b"-" * 79)
        self.stream.write(b"\n")

    def send(self, email_messages: list[EmailMessage]):
        """Write all messages to the stream in a thread-safe way."""
        if not email_messages:
            return
        msg_count = 0
        with self._lock:
            try:
                stream_created = self.open()
                for message in email_messages:
                    self.write_message(message)
                    self.stream.flush()  # flush after each message
                    msg_count += 1
                if stream_created:
                    self.close()
            except Exception:
                raise
        return msg_count

    def _get_filename(self):
        
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        fname = "%s-%s.log" % (timestamp, abs(id(self)))
        self._fname = os.path.join(self.directory, fname)
        return self._fname
    
    def open(self):
        if self.stream is None:
            self.stream = open(self._get_filename(), "ab")
            return True
        return False

    def close(self):
        try:
            if self.stream is not None:
                self.stream.close()
        finally:
            self.stream = None

    # def send(self, message: EmailMessage) -> str:
    #     self.directory.mkdir(parents=True, exist_ok=True)

    #     time = datetime.now().strftime(format="%d%m%Y%H%M%S")
    #     subject = message.subject
    #     slug = subject.lower().replace(" ", "-")
    #     filename = f"{slug}_{uuid4().hex}_{time}.eml"
    #     file_path = self.directory / filename

    #     with file_path.open("xb") as file:
    #         msg = message.message()
    #         msg_data = msg.as_bytes() + b"\n"
    #         file.write(msg)

    #     return str(file_path)

