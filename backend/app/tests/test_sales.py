def test_livestock_sale_updates_status(client, auth_headers, farm_and_store):
    livestock_resp = client.post("/api/v1/livestock", json={
        "farm_id": farm_and_store["farm_id"],
        "tag_number": "COW-002",
        "species": "Cattle",
        "sex": "MALE",
    }, headers=auth_headers)
    livestock_id = livestock_resp.json()["id"]

    customer_resp = client.post("/api/v1/customers", json={"name": "John Buyer"}, headers=auth_headers)
    customer_id = customer_resp.json()["id"]

    resp = client.post("/api/v1/sales", json={
        "customer_id": customer_id,
        "sale_date": "2026-08-20",
        "payment_status": "PAID",
        "items": [{"item_type": "LIVESTOCK", "livestock_id": livestock_id, "quantity": "1", "unit_price": "50000"}],
    }, headers=auth_headers)
    assert resp.status_code == 200

    animal_resp = client.get("/api/v1/livestock", params={"search": "COW-002"}, headers=auth_headers)
    assert animal_resp.json()[0]["status"] == "SOLD"


def test_product_sale_decreases_inventory(client, auth_headers, farm_and_store):
    item_resp = client.post("/api/v1/inventory", json={
        "store_id": farm_and_store["store_id"],
        "name": "Fresh Milk",
        "category": "OTHER",
        "unit": "litre",
        "quantity_on_hand": "100",
        "reorder_level": "10",
        "purchase_price": "30",
    }, headers=auth_headers)
    item_id = item_resp.json()["id"]

    customer_resp = client.post("/api/v1/customers", json={"name": "Milk Buyer"}, headers=auth_headers)
    customer_id = customer_resp.json()["id"]

    resp = client.post("/api/v1/sales", json={
        "customer_id": customer_id,
        "sale_date": "2026-08-20",
        "payment_status": "PAID",
        "items": [{"item_type": "PRODUCT", "inventory_item_id": item_id, "quantity": "20", "unit_price": "60"}],
    }, headers=auth_headers)
    assert resp.status_code == 200

    item_resp = client.get("/api/v1/inventory", params={"search": "Fresh Milk"}, headers=auth_headers)
    assert float(item_resp.json()[0]["quantity_on_hand"]) == 80
