from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.company import Company
from app.utils.password import hash_password

DEFAULT_ROLES = ["ADMIN", "ESG_MANAGER", "EXECUTIVE", "AUDITOR"]

ADMIN_EMAIL = "admin@verdustry.com"
ADMIN_PASSWORD = "admin123"


def seed(db: Session):
    roles = {}
    for role_name in DEFAULT_ROLES:
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            role = Role(name=role_name)
            db.add(role)
            db.commit()
            db.refresh(role)
            print(f"Rôle créé : {role_name}")
        roles[role_name] = role

    company = db.query(Company).filter(Company.name == "Verdustry Demo").first()
    if not company:
        company = Company(
            name="Verdustry Demo",
            sector="Technology",
            country="Tunisia",
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        print("Company créée : Verdustry Demo")

    admin_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin_user:
        admin_user = User(
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            full_name="Administrator",
            role_id=roles["ADMIN"].id,
            is_active=True,
            company_id=company.id,
        )
        db.add(admin_user)
        db.commit()
        print(f"Utilisateur admin créé : {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    else:
        if admin_user.company_id is None:
            admin_user.company_id = company.id
            db.commit()
        print("Utilisateur admin déjà existant")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
