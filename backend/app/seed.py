import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database import engine, SessionLocal
from .models import Base, FamilyTree, Person, Marriage, MarriageRank, PersonStatus

def seed_db():
    print("Dropping and recreating tables...")
    # Base.metadata.drop_all(bind=engine) # Careful in prod!
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Create Tree
    tree = FamilyTree(name="Gia phả họ Nguyễn (Seed 4 Đời)", description="Dữ liệu mẫu 4 đời có đa thê")
    db.add(tree)
    db.commit()
    db.refresh(tree)
    
    # 2. Generation 1 (Thủy Tổ)
    thuy_to = Person(
        family_tree_id=tree.id,
        full_name="Nguyễn Văn Tổ",
        gender="M",
        status=PersonStatus.DECEASED,
        solar_birth_date="1850-01-01",
        generation=1,
        birth_order=1  # Khởi Tổ
    )
    vo_ca = Person(
        family_tree_id=tree.id,
        full_name="Trần Thị Nhất",
        gender="F",
        status=PersonStatus.DECEASED,
        generation=1
    )
    vo_hai = Person(
        family_tree_id=tree.id,
        full_name="Lê Thị Hai",
        gender="F",
        status=PersonStatus.DECEASED,
        generation=1
    )
    db.add_all([thuy_to, vo_ca, vo_hai])
    db.commit()
    
    m1 = Marriage(family_tree_id=tree.id, husband_id=thuy_to.id, wife_id=vo_ca.id, rank=MarriageRank.MAIN)
    m2 = Marriage(family_tree_id=tree.id, husband_id=thuy_to.id, wife_id=vo_hai.id, rank=MarriageRank.SECOND)
    db.add_all([m1, m2])
    db.commit()

    # 3. Generation 2 (Con của Vợ Cả và Vợ Hai)
    con_c1 = Person(family_tree_id=tree.id, full_name="Nguyễn Văn Đại", gender="M", status=PersonStatus.DECEASED, generation=2, father_id=thuy_to.id, mother_id=vo_ca.id, birth_order=1)  # Trưởng nam vợ cả
    con_c2 = Person(family_tree_id=tree.id, full_name="Nguyễn Thị Gái", gender="F", status=PersonStatus.DECEASED, generation=2, father_id=thuy_to.id, mother_id=vo_ca.id, birth_order=2)
    
    con_h1 = Person(family_tree_id=tree.id, full_name="Nguyễn Văn Nhị", gender="M", status=PersonStatus.DECEASED, generation=2, father_id=thuy_to.id, mother_id=vo_hai.id, birth_order=1)  # Trưởng nam vợ hai
    db.add_all([con_c1, con_c2, con_h1])
    db.commit()

    # Generation 2 Marriages
    vo_dai = Person(family_tree_id=tree.id, full_name="Phạm Thị Kính", gender="F", status=PersonStatus.DECEASED, generation=2)
    vo_nhi = Person(family_tree_id=tree.id, full_name="Hoàng Thị Lan", gender="F", status=PersonStatus.DECEASED, generation=2)
    db.add_all([vo_dai, vo_nhi])
    db.commit()
    
    m3 = Marriage(family_tree_id=tree.id, husband_id=con_c1.id, wife_id=vo_dai.id, rank=MarriageRank.MAIN)
    m4 = Marriage(family_tree_id=tree.id, husband_id=con_h1.id, wife_id=vo_nhi.id, rank=MarriageRank.MAIN)
    db.add_all([m3, m4])
    db.commit()

    # 4. Generation 3
    chau_1 = Person(family_tree_id=tree.id, full_name="Nguyễn Văn Cháu", gender="M", status=PersonStatus.ALIVE, generation=3, father_id=con_c1.id, mother_id=vo_dai.id, birth_order=1)
    chau_2 = Person(family_tree_id=tree.id, full_name="Nguyễn Thị Chắt", gender="F", status=PersonStatus.ALIVE, generation=3, father_id=con_h1.id, mother_id=vo_nhi.id, birth_order=1)
    db.add_all([chau_1, chau_2])
    db.commit()

    vo_chau = Person(family_tree_id=tree.id, full_name="Đặng Thị Đẹp", gender="F", status=PersonStatus.ALIVE, generation=3)
    db.add(vo_chau)
    db.commit()

    m5 = Marriage(family_tree_id=tree.id, husband_id=chau_1.id, wife_id=vo_chau.id, rank=MarriageRank.MAIN)
    db.add(m5)
    db.commit()

    # 5. Generation 4
    chat_1 = Person(family_tree_id=tree.id, full_name="Nguyễn Văn Gen Z", gender="M", status=PersonStatus.ALIVE, generation=4, father_id=chau_1.id, mother_id=vo_chau.id, birth_order=1)
    db.add(chat_1)
    db.commit()

    print("Seeding complete! Tree generated with 4 generations.")
    db.close()

if __name__ == "__main__":
    seed_db()
