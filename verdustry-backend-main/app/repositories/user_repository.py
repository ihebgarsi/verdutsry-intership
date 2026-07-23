from typing import Optional, List
from sqlalchemy.orm import Session, joinedload

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return (
            self.db.query(User)
            .options(joinedload(User.role))
            .filter(User.id == user_id)
            .first()
        )

    def get_by_email(self, email: str) -> Optional[User]:
        return (
            self.db.query(User)
            .options(joinedload(User.role))
            .filter(User.email == email)
            .first()
        )

    def get_all(self) -> List[User]:
        return self.db.query(User).options(joinedload(User.role)).all()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self.get_by_id(user.id) or user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return self.get_by_id(user.id) or user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()
