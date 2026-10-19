import os
from typing import Any

import requests

from middlewares.logging.logger import logger
from shared.data.schemas.requests.base_request import BaseRequest

Base_API_URL = "https://api.ghanapostgps.com/v2/PublicGPGPSAPI.aspx"

CorsByPass = [
    "Base-Url",
    "Client-IP",
    "Http-Url",
    "Proxy-Host",
    "Proxy-Url",
    "Real-Ip",
    "Redirect",
    "Referer",
    "Referrer",
    "Refferer",
    "Request-Uri",
    "Uri",
    "Url",
    "X-Client-Ip",
    "X-Forwarded-For",
    "Cf-Connecting-Ip",
    "X-Client-IP",
    "X-Custom-IP-Authorization",
    "X-Forward-For",
    "X-Forwarded-By",
    "X-Forwarded-By-Original",
    "X-Forwarded-For-Original",
    "X-Forwarded-Host",
    "X-Forwarded-Server",
    "X-Forwarder-For",
    "X-HTTP-Destinationurl",
    "X-Http-Host-Override",
    "X-Original-Remote-Addr",
    "X-Original-Url",
    "X-Originating-IP",
    "X-Proxy-Url",
    "X-Remote-Addr",
    "X-Remote-IP",
    "X-Rewrite-Url",
    "X-True-IP",
    "Fastly-Client-Ip",
    "True-Client-Ip",
    "X-Cluster-Client-Ip",
    "X-Forwarded",
    "Forwarded-For",
    "Forwarded",
    "X-Real-Ip",
]


class Params(BaseRequest):
    ApiURL: str
    Authorization: str
    AsaaseUser: str
    LanguageCode: str
    Language: str
    DeviceId: str
    AndrodCert: str
    AndroidPackage: str
    Country: str
    CountryName: str


def get_api_key(params: Params) -> str:
    return f"""GPGPS_apiURL={params.ApiURL}
GPGPS_authorization={params.Authorization}
GPGPS_asaaseUser={params.AsaaseUser}
GPGPS_languageCode={params.LanguageCode}
GPGPS_language={params.Language}
GPGPS_deviceId={params.DeviceId}
GPGPS_androidCert={params.AndroidCert}
GPGPS_androidPackage={params.AndroidPackage}
GPGPS_countryName={params.CountryName}
GPGPS_country={params.Country}"""


async def api_request(payload: dict) -> dict | None:
    try:
        headers: dict[str, str] = {
            "Authorization": f"Basic {os.getenv('gps_Authorization')}",
            "LanguageCode": os.getenv("gps_LanguageCode"),
            "Language": os.getenv("gps_Language"),
            "CountryName": os.getenv("gps_CountryName"),
            "DeviceId": os.getenv("gps_DeviceId"),
            "X-Android-Cert": os.getenv("gps_AndroidCert"),
            "AsaaseUser": os.getenv("gps_AsaaseUser"),
            "Country": os.getenv("gps_Country"),
            "X-Android-Package": os.getenv("gps_AndroidPackage"),
            "Content-Type": "application/x-www-form-urlencoded",
        }

        for ch in CorsByPass:
            headers[ch] = "127.0.0.1"

        response = requests.post(Base_API_URL, payload, headers=headers)

        if response.status_code == 200:
            return response.json()

        return None

    except Exception as e:
        logger.error(f"Service: GPGPS error: {e}")
        return ""


def Is_valid_gps_address(address: str) -> list[bool, str]:
    formatted = format_str(address)
    return [formatted.length >= 9, formatted]


async def get_location(code: str) -> str:
    return await api_request(
        {
            "AsaaseLogs": "",
            "Action": "GetLocation",
            "GPSName": code,
        }
    )


async def get_address(latitude: str, longitude: str, params: Params) -> str:
    return await api_request(
        {
            "AsaaseLogs": "",
            "Action": "GetGPSName",
            "Lati": latitude,
            "Longi": longitude,
        }
    )


def format_str(address: str) -> str:
    return "".join(address.strip().upper().split("-"))


async def send_login_sms(phone: str) -> str:
    return api_request(
        {
            "AsaaseLogs": "",
            "Action": "SendSMS",
            "GPSName": phone,
        }
    )


async def VerifySMS(phone: str, code: str, params: Params) -> str:
    return api_request(
        {
            "AsaaseLogs": "",
            "Action": "VerifyCode",
            "GPSName": code,
            "MSISDN": phone,
        }
    )


async def AddCustomer(
    firstName: str, lastName: str, phone: str, uuid: str, params: Params
) -> str:
    return api_request(
        {
            "AsaaseLogs": "",
            "Action": "AddCustomer",
            "FirstName": firstName,
            "LastName": lastName,
            "MobileNumber": phone,
            "Msisdn": phone,
            "IMSI": phone,
            "IMEI": phone,
            "DeviceID": uuid,
        }
    )


async def GetUserAddress(phone: str, uuid: str, params: Params) -> str:
    return api_request(
        {
            "AsaaseLogs": "",
            "Action": "GetUserAddress",
            "MSISDN": phone,
            "DeviceID": uuid,
        }
    )


async def GetSIPDetails(phone: str, params: Params) -> str:
    return api_request(
        {
            "AsaaseLogs": "",
            "Action": "GetSIPDetails",
            "MSISDN": phone,
        }
    )
