def test_get_users_as_admin(client, admin_token):
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "role" in data[0]
    assert data[0]["role"] == "ADMIN"


def test_login_includes_company_name(client):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"email": "admin@verdustry.com", "password": "admin123"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["companyName"] == "Verdustry Demo"


def test_get_users_without_token(client):
    response = client.get("/api/v1/users")
    assert response.status_code == 401


def test_create_user_as_admin(client, admin_token):
    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "newuser@verdustry.com",
            "password": "password123",
            "name": "New User",
            "role": "EXECUTIVE",
            "companyId": "1",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@verdustry.com"
    assert data["role"] == "EXECUTIVE"
    assert data["name"] == "New User"
    assert data["companyId"] == "1"


def test_create_user_requires_company(client, admin_token):
    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "nocompany@verdustry.com",
            "password": "password123",
            "name": "No Company",
            "role": "ESG_MANAGER",
        },
    )
    assert response.status_code == 422


def test_create_user_duplicate_email(client, admin_token):
    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "admin@verdustry.com",
            "password": "password123",
            "name": "Duplicate",
            "role": "EXECUTIVE",
            "companyId": "1",
        },
    )
    assert response.status_code == 409


def test_get_user_by_id(client, admin_token):
    response = client.get(
        "/api/v1/users/1",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == "1"


def test_get_user_not_found(client, admin_token):
    response = client.get(
        "/api/v1/users/9999",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 404


def test_update_user(client, admin_token):
    response = client.put(
        "/api/v1/users/1",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_delete_user(client, admin_token, db_session):
    from app.models.role import Role
    from app.models.user import User
    from app.utils.password import hash_password

    role = db_session.query(Role).filter(Role.name == "EXECUTIVE").first()
    user = User(
        email="todelete@verdustry.com",
        hashed_password=hash_password("password123"),
        full_name="To Delete",
        role_id=role.id,
        is_active=True,
        company_id=1,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    response = client.delete(
        f"/api/v1/users/{user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 204


def test_non_admin_cannot_create_user(client, db_session):
    from app.models.role import Role
    from app.models.user import User
    from app.utils.password import hash_password

    exec_role = db_session.query(Role).filter(Role.name == "EXECUTIVE").first()
    exec_user = User(
        email="exec@verdustry.com",
        hashed_password=hash_password("execpass"),
        full_name="Executive",
        role_id=exec_role.id,
        is_active=True,
        company_id=1,
    )
    db_session.add(exec_user)
    db_session.commit()

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "exec@verdustry.com", "password": "execpass"},
    )
    exec_token = login_response.json()["access_token"]

    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {exec_token}"},
        json={
            "email": "shouldfail@verdustry.com",
            "password": "password123",
            "name": "Should Fail",
            "role": "EXECUTIVE",
            "companyId": "1",
        },
    )
    assert response.status_code == 403
