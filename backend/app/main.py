from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.responses import FileResponse
from typing import List
import os
from datetime import date
from lunarcalendar import Converter, Solar, Lunar
from fpdf import FPDF
from .database import engine, Base, get_db
from .models import Person, Marriage, User, PersonStatus, FamilyTree, Event, SiteSetting, MarriageRank
from .schemas import PersonCreate, PersonResponse, MarriageCreate, MarriageResponse, MarriageUpdate, SpouseCreate, FamilyTreeCreate, FamilyTreeResponse, EventCreate, EventResponse, UserCreate, UserResponse, SiteSettingUpdate, SiteSettingResponse
from .auth import get_password_hash, verify_password, create_access_token, get_current_user
from .database import engine, Base

# Create tables
# Note: For production, we should use Alembic
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DTGen V2 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}

# --- FAMILY TREES ---
@app.get("/api/family_trees", response_model=List[FamilyTreeResponse])
def get_family_trees(db: Session = Depends(get_db)):
    return db.query(FamilyTree).all()

@app.post("/api/family_trees", response_model=FamilyTreeResponse)
def create_family_tree(tree: FamilyTreeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_tree = FamilyTree(**tree.model_dump())
    db.add(db_tree)
    db.commit()
    db.refresh(db_tree)
    return db_tree

@app.put("/api/family_trees/{tree_id}", response_model=FamilyTreeResponse)
def update_family_tree(tree_id: int, tree_update: FamilyTreeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_tree = db.query(FamilyTree).filter(FamilyTree.id == tree_id).first()
    if not db_tree:
        raise HTTPException(status_code=404, detail="Family tree not found")
        
    for key, value in tree_update.model_dump().items():
        setattr(db_tree, key, value)
        
    db.commit()
    db.refresh(db_tree)
    return db_tree

@app.get("/api/persons", response_model=List[PersonResponse])
def get_persons(db: Session = Depends(get_db)):
    return db.query(Person).all()

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/persons", response_model=PersonResponse)
def create_person(person: PersonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # --- Auto Spouse Logic ---
    if person.father_id and not person.mother_id:
        father = db.query(Person).filter(Person.id == person.father_id).first()
        if father:
            marriages = db.query(Marriage).filter(Marriage.husband_id == father.id).order_by(Marriage.id).all()
            if not marriages:
                unknown_wife = Person(
                    family_tree_id=person.family_tree_id,
                    full_name="Vợ chưa rõ",
                    gender="F",
                    status=PersonStatus.UNKNOWN,
                    generation=father.generation
                )
                db.add(unknown_wife)
                db.flush()
                
                new_marriage = Marriage(
                    family_tree_id=person.family_tree_id,
                    husband_id=father.id,
                    wife_id=unknown_wife.id,
                    rank=MarriageRank.UNKNOWN
                )
                db.add(new_marriage)
                db.flush()
                
                person.mother_id = unknown_wife.id
            else:
                person.mother_id = marriages[0].wife_id

    elif person.mother_id and not person.father_id:
        mother = db.query(Person).filter(Person.id == person.mother_id).first()
        if mother:
            marriages = db.query(Marriage).filter(Marriage.wife_id == mother.id).order_by(Marriage.id).all()
            if not marriages:
                unknown_husband = Person(
                    family_tree_id=person.family_tree_id,
                    full_name="Chồng chưa rõ",
                    gender="M",
                    status=PersonStatus.UNKNOWN,
                    generation=mother.generation
                )
                db.add(unknown_husband)
                db.flush()
                
                new_marriage = Marriage(
                    family_tree_id=person.family_tree_id,
                    husband_id=unknown_husband.id,
                    wife_id=mother.id,
                    rank=MarriageRank.UNKNOWN
                )
                db.add(new_marriage)
                db.flush()
                
                person.father_id = unknown_husband.id
    # --- End Auto Spouse Logic ---

    db_person = Person(**person.model_dump())
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    
    # Auto-create User account logic (inactive by default)
    # Generate simple username based on id
    username = f"user_{db_person.id}"
    new_user = User(
        username=username,
        password_hash="hashed_default_password",
        is_active=False,
        person_id=db_person.id
    )
    db.add(new_user)
    db.commit()
    
    return db_person

@app.put("/api/persons/{person_id}", response_model=PersonResponse)
def update_person(person_id: int, person_update: PersonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_person = db.query(Person).filter(Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
        
    for key, value in person_update.model_dump().items():
        setattr(db_person, key, value)
        
    if db_person.status == 'DECEASED':
        user = db.query(User).filter(User.person_id == db_person.id).first()
        if user:
            user.is_active = False
            
    db.commit()
    db.refresh(db_person)
    return db_person

@app.post("/api/persons/{person_id}/spouse", response_model=PersonResponse)
def add_spouse(person_id: int, payload: SpouseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    # Create the spouse
    new_spouse = Person(**payload.person.model_dump())
    db.add(new_spouse)
    db.flush() # flush to get spouse id

    # Create the marriage
    if person.gender == 'M':
        husband_id = person.id
        wife_id = new_spouse.id
    else:
        husband_id = new_spouse.id
        wife_id = person.id

    marriage_rank = payload.marriage.rank if payload.marriage else MarriageRank.UNKNOWN

    new_marriage = Marriage(
        family_tree_id=person.family_tree_id,
        husband_id=husband_id,
        wife_id=wife_id,
        rank=marriage_rank,
        start_date=payload.marriage.start_date if payload.marriage else None,
        end_date=payload.marriage.end_date if payload.marriage else None
    )
    db.add(new_marriage)
    db.commit()
    db.refresh(new_spouse)
    return new_spouse

@app.delete("/api/persons/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(person_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_person = db.query(Person).filter(Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Also delete user if attached
    user = db.query(User).filter(User.person_id == db_person.id).first()
    if user:
        db.delete(user)
        
    db.delete(db_person)
    db.commit()
    return None

@app.get("/api/marriages", response_model=List[MarriageResponse])
def get_marriages(db: Session = Depends(get_db)):
    return db.query(Marriage).all()

@app.post("/api/marriages", response_model=MarriageResponse)
def create_marriage(marriage: MarriageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_marriage = Marriage(**marriage.model_dump())
    db.add(db_marriage)
    db.commit()
    db.refresh(db_marriage)
    return db_marriage

@app.put("/api/marriages/{marriage_id}", response_model=MarriageResponse)
def update_marriage(marriage_id: int, marriage_update: MarriageUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_marriage = db.query(Marriage).filter(Marriage.id == marriage_id).first()
    if not db_marriage:
        raise HTTPException(status_code=404, detail="Marriage not found")
        
    for key, value in marriage_update.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(db_marriage, key, value)
            
    db.commit()
    db.refresh(db_marriage)
    return db_marriage

@app.delete("/api/marriages/{marriage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_marriage(marriage_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_marriage = db.query(Marriage).filter(Marriage.id == marriage_id).first()
    if not db_marriage:
        raise HTTPException(status_code=404, detail="Marriage not found")
    db.delete(db_marriage)
    db.commit()
    return None

# --- EVENTS ---
@app.get("/api/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.lunar_month, Event.lunar_day).all()

# --- Site Settings ---
@app.get("/api/settings/landing", response_model=SiteSettingResponse)
def get_landing_settings(db: Session = Depends(get_db)):
    setting = db.query(SiteSetting).first()
    if not setting:
        setting = SiteSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@app.put("/api/settings/landing", response_model=SiteSettingResponse)
def update_landing_settings(settings: SiteSettingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    setting = db.query(SiteSetting).first()
    if not setting:
        setting = SiteSetting()
        db.add(setting)
    
    update_data = settings.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(setting, key, value)
        
    db.commit()
    db.refresh(setting)
    return setting


@app.post("/api/events", response_model=EventResponse)
def create_event(event: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_event = Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/api/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return None

# --- USERS ---
@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/api/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        password_hash=hashed_password,
        role=user.role,
        is_active=user.is_active,
        person_id=user.person_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/lunar")
def convert_to_lunar(year: int, month: int, day: int):
    try:
        solar = Solar(year, month, day)
        lunar = Converter.Solar2Lunar(solar)
        return {"solar": f"{year}-{month}-{day}", "lunar": f"{lunar.year}-{lunar.month}-{lunar.day}", "is_leap": lunar.isleap}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/biography/{person_id}")
def generate_biography(person_id: int, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Person not found")
        
    bio_parts = []
    
    # 1. Introduction
    title = "Ông" if p.gender == 'M' else "Bà"
    bio_parts.append(f"{title} {p.full_name}, sinh năm {p.birth_year or 'chưa rõ'}.")
    
    if p.status == 'DECEASED':
        bio_parts.append(f"Mất năm {p.death_year or 'chưa rõ'}.")
        
    # 2. Parents
    if p.father_id:
        father = db.query(Person).filter(Person.id == p.father_id).first()
        if father:
            bio_parts.append(f"Là con của ông {father.full_name}.")
            
    # 3. Spouses
    if p.gender == 'M':
        marriages = db.query(Marriage).filter(Marriage.husband_id == p.id).all()
        if marriages:
            for m in marriages:
                wife = db.query(Person).filter(Person.id == m.wife_id).first()
                if wife:
                    bio_parts.append(f"Lập gia đình với bà {wife.full_name} ({m.rank}).")
    else:
        marriages = db.query(Marriage).filter(Marriage.wife_id == p.id).all()
        if marriages:
            for m in marriages:
                husband = db.query(Person).filter(Person.id == m.husband_id).first()
                if husband:
                    bio_parts.append(f"Lập gia đình với ông {husband.full_name}.")
                    
    # 4. Children
    children = db.query(Person).filter((Person.father_id == p.id) | (Person.mother_id == p.id)).all()
    if children:
        child_names = ", ".join([c.full_name for c in children])
        bio_parts.append(f"Sinh được {len(children)} người con: {child_names}.")
        
    return {"person_id": p.id, "biography": " ".join(bio_parts)}

@app.get("/api/biography/{person_id}/pdf")
def generate_biography_pdf(person_id: int, db: Session = Depends(get_db)):
    bio_data = generate_biography(person_id, db)
    p = db.query(Person).filter(Person.id == person_id).first()
    
    pdf = FPDF()
    pdf.add_page()
    
    # Setup font
    font_path = os.path.join(os.path.dirname(__file__), "fonts", "arial.ttf")
    pdf.add_font("Arial", "", font_path, uni=True)
    pdf.set_font("Arial", size=16)
    
    # Title
    pdf.cell(200, 10, txt="PHẢ KÝ THÀNH VIÊN", ln=True, align='C')
    pdf.set_font("Arial", size=14)
    pdf.ln(10)
    
    # Content
    pdf.multi_cell(0, 10, txt=bio_data["biography"])
    
    pdf_path = f"/tmp/phaky_{person_id}.pdf"
    pdf.output(pdf_path)
    
    return FileResponse(path=pdf_path, filename=f"Pha_Ky_{p.full_name}.pdf", media_type="application/pdf")

@app.get("/api/family_trees/pdf")
def generate_full_phaky_pdf(db: Session = Depends(get_db)):
    trees = db.query(FamilyTree).all()
    default_tree = trees[0] if trees else None
    tree_name = default_tree.name if default_tree else 'Gia Phả Dòng Họ'
    tree_desc = default_tree.description if default_tree else 'Gia phả là cuốn sách ghi chép lại nguồn gốc, lịch sử và các thế hệ của một dòng họ...'
    
    persons = db.query(Person).order_by(Person.generation, Person.id).all()
    
    pdf = FPDF()
    pdf.add_page()
    
    # Setup font
    font_path = os.path.join(os.path.dirname(__file__), "fonts", "arial.ttf")
    pdf.add_font("Arial", "", font_path, uni=True)
    pdf.add_font("Arial", "B", font_path, uni=True) # Mocking bold with same font for simplicity or we can just use normal font
    
    # Title
    pdf.set_font("Arial", size=24)
    pdf.cell(0, 20, txt="PHẢ KÝ DÒNG HỌ", ln=True, align='C')
    pdf.set_font("Arial", size=16)
    pdf.cell(0, 10, txt=tree_name, ln=True, align='C')
    pdf.ln(10)
    
    # Intro
    pdf.set_font("Arial", size=14)
    pdf.multi_cell(0, 10, txt=tree_desc)
    pdf.ln(10)
    
    pdf.set_font("Arial", size=18)
    pdf.cell(0, 10, txt="CÁC BẬC TIỀN NHÂN", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", size=14)
    for p in persons:
        bio_data = generate_biography(p.id, db)
        
        # Generation header
        pdf.set_font("Arial", size=14) 
        pdf.multi_cell(0, 10, txt=f"Đời thứ {p.generation}: {p.full_name}")
        pdf.ln(2)
        
        # Content
        pdf.set_font("Arial", size=12)
        
        status_text = f"Nay thông tin về tiểu sử chưa được ghi chép đầy đủ."
        if p.bio:
            status_text = f"Sinh thời, {p.bio}"
            
        death_text = ""
        if p.status == 'DECEASED':
            death_text = f" Người đã tạ thế vào năm {p.death_year or 'không rõ'}, phần mộ nay đặt tại {p.burial_place or 'chưa rõ'}."
            
        full_text = f"Sinh năm {p.birth_year or 'không rõ'}, quê quán tại {p.origin_place or p.birth_place or 'chưa rõ'}. {status_text}{death_text} {bio_data['biography']}"
        pdf.multi_cell(0, 8, txt=full_text)
        pdf.ln(5)
    
    pdf_path = "/tmp/phaky_full.pdf"
    pdf.output(pdf_path)
    
    return FileResponse(path=pdf_path, filename="Pha_Ky_Dong_Ho.pdf", media_type="application/pdf")

@app.get("/api/statistics")
def get_statistics(db: Session = Depends(get_db)):
    total_members = db.query(Person).count()
    total_males = db.query(Person).filter(Person.gender == 'M').count()
    total_females = db.query(Person).filter(Person.gender == 'F').count()
    
    total_alive = db.query(Person).filter(Person.status == PersonStatus.ALIVE).count()
    total_deceased = db.query(Person).filter(Person.status == PersonStatus.DECEASED).count()
    
    generations_data = db.query(Person.generation, func.count(Person.id)).group_by(Person.generation).order_by(Person.generation).all()
    generations = [{"generation": g[0], "count": g[1]} for g in generations_data]
    
    return {
        "total_members": total_members,
        "genders": {"male": total_males, "female": total_females},
        "status": {"alive": total_alive, "deceased": total_deceased},
        "generations": generations
    }

