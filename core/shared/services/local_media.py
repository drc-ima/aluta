import os
import shutil
import base64

from fastapi import HTTPException, UploadFile

from core import BASE_DIR


class MediaServices:

    def __init__(self):
        self.directory = BASE_DIR / os.getenv("MEDIA_PATH") or "dummies/media"

    def base64_upload(self, to: str, base64_str: str, filename: str) -> str:
        file_bytes = base64.b64decode(base64_str)

        save_path = self.directory / to / filename

        save_path.parent.mkdir(parents=True, exist_ok=True)

        with open(save_path, "wb") as f:
            f.write(file_bytes)

        port = os.getenv("PORT", "8000")
        blob_url = f"http://localhost:{port}/media/{to}/{filename}"

        return blob_url
    
    async def upload(self, to: str, file: UploadFile) -> str:
        try:
            file_path = self.directory / to / file.filename

            file_path.mkdir(parents=True, exist_ok=True)
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        finally:
            await file.close()

        blob_url = f"http://localhost:{os.getenv("PORT")}/media/{to}/{file.filename}"
        return blob_url

    async def upload_multiple(self, to: str, files: list[UploadFile]) -> list[str]:

        uploaded_files = []

        for file in files:
            file_path = self.upload(to=to, file=file)
            uploaded_files.append(file_path)

        return uploaded_files
            

        


