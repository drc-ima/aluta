from email.message import EmailMessage
import os
from pathlib import Path
from core import BASE_DIR
from middlewares.logging.logger import logger
from shared.utils.email import FileEmail
from shared.data.schemas.domain.email import EmailMessageSchema


class EmailService:
    
    def __init__(self):
        self.system = os.getenv("EMAIL_SYSTEM") or "file"

        if self.system == "file":
            directory = BASE_DIR / os.getenv("EMAIL_FILE_PATH") or "dummies/emails"
            
            self.backend = FileEmail(
                directory=directory
            )
        else:
            directory = self.BASE_DIR / os.getenv("EMAIL_FILE_PATH") or "dummies/emails"
            self.backend = FileEmail(
                directory=directory
            )
        
    def send(self, data: EmailMessageSchema) -> str:
        logger.info("Sending email...")
        message = EmailMessage()
        message["From"] = os.getenv("EMAIL_FROM")
        message["To"] = ", ".join(str(email) for email in data.to)
        message["Subject"] = data.subject

        message.set_content(data.body)

        if data.html_body:
            message.add_alternative(
                data.html_body,
                subtype="html"
            )

        logger.info("Email sent...")
        return self.backend.send(message)

    def body_context(self, content: str, **kwargs):
        formatted = content.format(**kwargs)

        return formatted


email_sender = EmailService()