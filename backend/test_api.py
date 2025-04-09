import requests
import json

BASE_URL = "http://127.0.0.1:3000"

def test_health():
    response = requests.get(f"{BASE_URL}/health")
    print("\nHealth Check:")
    print(json.dumps(response.json(), indent=2))

def test_analyze():
    sample_contract = """
    This agreement shall automatically renew for an additional term of one year unless terminated by either party.
    The licensee shall pay a monthly fee of $99.99 for the service.
    All disputes shall be resolved through binding arbitration.
    """
    
    response = requests.post(
        f"{BASE_URL}/api/analyze",
        json={"text": sample_contract}
    )
    print("\nContract Analysis:")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    print("Testing Fineprint API...")
    test_health()
    test_analyze() 