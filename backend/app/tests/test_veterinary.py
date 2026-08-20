def test_treatment_decreases_medicine_stock(client, auth_headers, farm_and_store):
    medicine_resp = client.post("/api/v1/inventory", json={
        "store_id": farm_and_store["store_id"],
        "name": "Amoxicillin",
        "category": "ANTIBIOTICS",
        "unit": "ml",
        "quantity_on_hand": "50",
        "reorder_level": "10",
        "purchase_price": "5",
    }, headers=auth_headers)
    medicine_id = medicine_resp.json()["id"]

    livestock_resp = client.post("/api/v1/livestock", json={
        "tag_number": "COW-001",
        "species": "Cattle",
        "sex": "FEMALE",
    }, headers=auth_headers)
    livestock_id = livestock_resp.json()["id"]

    resp = client.post("/api/v1/veterinary", json={
        "livestock_id": livestock_id,
        "medicine_item_id": medicine_id,
        "treatment_type": "ANTIBIOTIC",
        "diagnosis": "Mastitis",
        "dosage_quantity": "15",
        "treatment_date": "2026-08-20",
    }, headers=auth_headers)
    assert resp.status_code == 200

    item_resp = client.get("/api/v1/inventory", params={"search": "Amoxicillin"}, headers=auth_headers)
    updated_item = item_resp.json()[0]
    assert float(updated_item["quantity_on_hand"]) == 35
