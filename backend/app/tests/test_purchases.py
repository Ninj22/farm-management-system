def test_purchase_increases_inventory(client, auth_headers, farm_and_store):
    item_resp = client.post("/api/v1/inventory", json={
        "store_id": farm_and_store["store_id"],
        "name": "Maize Seed",
        "category": "SEEDS",
        "unit": "kg",
        "quantity_on_hand": "0",
        "reorder_level": "5",
        "purchase_price": "10",
    }, headers=auth_headers)
    item_id = item_resp.json()["id"]

    supplier_resp = client.post("/api/v1/suppliers", json={"name": "Kenya Seed Co"}, headers=auth_headers)
    supplier_id = supplier_resp.json()["id"]

    resp = client.post("/api/v1/purchases", json={
        "supplier_id": supplier_id,
        "purchase_date": "2026-08-20",
        "payment_status": "PAID",
        "items": [{"item_id": item_id, "quantity": "100", "unit_price": "10"}],
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert float(resp.json()["total_amount"]) == 1000

    item_resp = client.get("/api/v1/inventory", params={"search": "Maize"}, headers=auth_headers)
    updated_item = item_resp.json()[0]
    assert float(updated_item["quantity_on_hand"]) == 100
