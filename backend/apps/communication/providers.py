from abc import ABC, abstractmethod
from django.conf import settings
from decouple import config

class BaseSMSProvider(ABC):
    @abstractmethod
    def send_sms(self, phone_number: str, message: str) -> dict:
        pass

class AfricasTalkingProvider(BaseSMSProvider):
    def send_sms(self, phone_number: str, message: str) -> dict:
        print(f"[Mock AT SMS] To: {phone_number}, Msg: {message}")
        return {"status": "Sent", "message_id": "AT-mock-123"}

class TwilioProvider(BaseSMSProvider):
    def send_sms(self, phone_number: str, message: str) -> dict:
        print(f"[Mock Twilio SMS] To: {phone_number}, Msg: {message}")
        return {"status": "Sent", "message_id": "TW-mock-456"}

def get_sms_provider() -> BaseSMSProvider:
    provider_name = config('SMS_PROVIDER', default='AFRICAS_TALKING')
    if provider_name == 'TWILIO':
        return TwilioProvider()
    return AfricasTalkingProvider()
