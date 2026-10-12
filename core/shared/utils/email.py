from email.message import EmailMessage
from pathlib import Path
from uuid import uuid4
from datetime import datetime

class FileEmail:
    def __init__(self, directory: Path):
        self.directory = directory

    def send(self, message: EmailMessage) -> str:
        self.directory.mkdir(parents=True, exist_ok=True)

        time = datetime.now().strftime(format="%d%m%Y%H%M%S")
        subject = message.get("subject")
        slug = subject.lower().replace(" ", "-")
        filename = f"{slug}_{uuid4().hex}_{time}.eml"
        file_path = self.directory / filename

        with file_path.open("xb") as file:
            msg = message
            msg = msg.as_bytes() + b"\n"
            file.write(msg)

        return str(file_path)

