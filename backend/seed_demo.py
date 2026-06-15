import sys
import os
import random

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import SessionLocal
from app.models import Person, Marriage, FamilyTree

db = SessionLocal()

def clear_db():
    db.query(Marriage).delete()
    db.query(Person).delete()
    db.query(FamilyTree).delete()
    db.commit()

def seed_demo():
    print("Clearing database...")
    clear_db()
    
    # Create family tree
    tree = FamilyTree(name="Gia phả họ Nguyễn (Demo 10 Đời)")
    db.add(tree)
    db.commit()
    db.refresh(tree)

    print(f"Created FamilyTree: {tree.name}")

    # Helper function to create person
    def create_person(name, gender, gen, father_id=None, mother_id=None):
        p = Person(
            family_tree_id=tree.id,
            full_name=name,
            gender=gender,
            generation=gen,
            status="DECEASED" if gen < 9 else "ALIVE",
            father_id=father_id,
            mother_id=mother_id
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return p

    def create_marriage(husband, wife, rank="VỢ CẢ"):
        m = Marriage(
            family_tree_id=tree.id,
            husband_id=husband.id,
            wife_id=wife.id,
            rank=rank
        )
        db.add(m)
        db.commit()
        return m

    # Generation 1: Khởi tổ
    g1_male = create_person("Nguyễn Tổ Khảo", "M", 1)
    g1_wife1 = create_person("Vương Thị Cả", "F", 1)
    g1_wife2 = create_person("Lê Thị Hai", "F", 1)
    create_marriage(g1_male, g1_wife1, "VỢ CẢ")
    create_marriage(g1_male, g1_wife2, "VỢ THỨ")

    # Keep track of males per generation to spawn next gen
    current_gen_males = [(g1_male, [g1_wife1, g1_wife2])]

    print("Generating 10 generations with polygamy...")
    for gen in range(2, 11):
        next_gen_males = []
        person_idx = 1
        
        for father, wives in current_gen_males:
            for wife in wives:
                # Give each wife 1-3 sons
                num_sons = random.randint(1, 3)
                for _ in range(num_sons):
                    son = create_person(f"Nguyễn Văn {gen}_{person_idx}", "M", gen, father_id=father.id, mother_id=wife.id)
                    
                    # Wives for the son
                    num_wives = random.choice([1, 1, 2, 3]) # Bias towards 1, but can have 2 or 3
                    son_wives = []
                    for w_idx in range(num_wives):
                        w_name = f"Thị {gen}_{person_idx}_{w_idx+1}"
                        w = create_person(w_name, "F", gen)
                        rank = "VỢ CẢ" if w_idx == 0 else ("VỢ THỨ" if w_idx == 1 else "VỢ KẾ")
                        create_marriage(son, w, rank)
                        son_wives.append(w)
                    
                    next_gen_males.append((son, son_wives))
                    person_idx += 1
        
        # Limit next gen to avoid exponential explosion
        # If we have too many, sample a few
        if len(next_gen_males) > 3:
            next_gen_males = random.sample(next_gen_males, 3)
            
        current_gen_males = next_gen_males

    print("Demo data created successfully! Reload the frontend to view.")

if __name__ == "__main__":
    seed_demo()
