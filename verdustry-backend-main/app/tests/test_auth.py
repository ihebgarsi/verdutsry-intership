def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@verdustry.com", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@verdustry.com"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["name"] == "Administrator"


def test_login_json_success(client):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "admin@verdustry.com", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "ADMIN"


def test_signup_success(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "companyName": "GreenTech",
            "sector": "Manufacturing",
            "country": "Tunisia",
            "adminName": "Sara",
            "email": "sara@greentech.tn",
            "password": "secret123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["company"]["name"] == "GreenTech"
    assert data["user"]["email"] == "sara@greentech.tn"
    assert data["user"]["role"] == "ADMIN"


def test_login_wrong_password(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@verdustry.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@verdustry.com", "password": "admin123"},
    )
    assert response.status_code == 401


def test_get_me_with_valid_token(client, admin_token):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@verdustry.com"
    assert data["role"] == "ADMIN"


def test_get_me_without_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_with_invalid_token(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401
