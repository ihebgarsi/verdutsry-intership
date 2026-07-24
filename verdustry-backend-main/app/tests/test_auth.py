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


def test_public_signup_removed(client):
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
    assert response.status_code == 404


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


def test_google_login_unknown_email_rejected(client, monkeypatch):
    def fake_verify(_token: str):
        return {
            "email": "google.user@example.com",
            "email_verified": True,
            "name": "Google User",
            "sub": "google-sub-1",
        }

    monkeypatch.setattr(
        "app.services.auth_service.verify_google_id_token",
        fake_verify,
    )

    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "fake.google.id.token.value"},
    )
    assert response.status_code == 404
    assert "No account found" in response.json()["detail"]


def test_google_login_existing_user(client, monkeypatch):
    def fake_verify(_token: str):
        return {
            "email": "admin@verdustry.com",
            "email_verified": True,
            "name": "Administrator",
            "sub": "google-sub-admin",
        }

    monkeypatch.setattr(
        "app.services.auth_service.verify_google_id_token",
        fake_verify,
    )

    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "fake.google.id.token.value"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "admin@verdustry.com"
