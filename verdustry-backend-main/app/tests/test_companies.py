def test_create_company_as_admin(client, admin_token):
    response = client.post(
        "/api/v1/companies",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "GreenTech",
            "sector": "Manufacturing",
            "country": "Tunisia",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "GreenTech"
    assert data["id"]


def test_list_companies_as_admin(client, admin_token):
    response = client.get(
        "/api/v1/companies",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


def test_create_company_without_token(client):
    response = client.post(
        "/api/v1/companies",
        json={"name": "X", "sector": "Y", "country": "Z"},
    )
    assert response.status_code == 401


def test_delete_company_with_users_blocked(client, admin_token):
    response = client.delete(
        "/api/v1/companies/1",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 409
