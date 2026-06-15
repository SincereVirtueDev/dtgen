from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User
from .auth import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            hashed_password = get_password_hash("123456")
            admin_user = User(
                username="admin",
                password_hash=hashed_password,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully (admin/123456)")
        else:
            print("Admin user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
