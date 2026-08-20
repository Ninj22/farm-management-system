def test_create_expense_and_summary(client, auth_headers):
    resp = client.post("/api/v1/expenses", json={
        "category": "FEED",
        "amount": "5000",
        "expense_date": "2026-08-20",
        "description": "Monthly dairy meal purchase",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert float(resp.json()["amount"]) == 5000

    resp = client.get("/api/v1/expenses/summary", headers=auth_headers)
    assert resp.status_code == 200
    categories = [row["category"] for row in resp.json()]
    assert "FEED" in categories
