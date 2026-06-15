from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .models import PersonStatus, MarriageRank, EventType, RoleEnum

class FamilyTreeBase(BaseModel):
    name: str
    description: Optional[str] = None

class FamilyTreeCreate(FamilyTreeBase):
    pass

class FamilyTreeResponse(FamilyTreeBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PersonBase(BaseModel):
    family_tree_id: int
    full_name: str
    other_names: Optional[str] = None
    gender: str
    status: PersonStatus = PersonStatus.ALIVE
    solar_birth_date: Optional[str] = None
    lunar_birth_date: Optional[str] = None
    birth_year: Optional[int] = None
    solar_death_date: Optional[str] = None
    lunar_death_date: Optional[str] = None
    death_year: Optional[int] = None
    job: Optional[str] = None
    origin_place: Optional[str] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    burial_place: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    notes: Optional[str] = None
    generation: int = 1
    birth_order: Optional[int] = None
    father_id: Optional[int] = None
    mother_id: Optional[int] = None

class PersonCreate(PersonBase):
    pass

class PersonResponse(PersonBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class MarriageBase(BaseModel):
    family_tree_id: int
    husband_id: int
    wife_id: int
    rank: MarriageRank = MarriageRank.MAIN
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None

class MarriageCreate(MarriageBase):
    pass

class MarriageUpdate(BaseModel):
    rank: Optional[MarriageRank] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None

class SpouseCreate(BaseModel):
    person: PersonCreate
    marriage: Optional[MarriageUpdate] = None

class MarriageResponse(MarriageBase):
    id: int
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    family_tree_id: int
    title: str
    event_type: EventType = EventType.OTHER
    lunar_day: Optional[int] = None
    lunar_month: Optional[int] = None
    is_recurring: bool = True
    related_person_id: Optional[int] = None
    description: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    role: RoleEnum = RoleEnum.MEMBER
    is_active: bool = False
    person_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SiteSettingBase(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    about_content: Optional[str] = None
    
    feature1_title: Optional[str] = None
    feature1_desc: Optional[str] = None
    feature2_title: Optional[str] = None
    feature2_desc: Optional[str] = None
    feature3_title: Optional[str] = None
    feature3_desc: Optional[str] = None
    footer_text: Optional[str] = None
    primary_color: Optional[str] = None

class SiteSettingUpdate(SiteSettingBase):
    pass

class SiteSettingResponse(SiteSettingBase):
    id: int
    class Config:
        from_attributes = True

