import enum
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import UserDefinedType
from .database import Base

class LtreeType(UserDefinedType):
    cache_ok = True
    def get_col_spec(self, **kw):
        return "LTREE"
    def bind_processor(self, dialect):
        def process(value):
            return value
        return process
    def result_processor(self, dialect, coltype):
        def process(value):
            return value
        return process

class RoleEnum(str, enum.Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN_GIATOC = "ADMIN_GIATOC"
    TRUONG_CHI = "TRUONG_CHI"
    MEMBER = "MEMBER"
    GUEST = "GUEST"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False) # can be phone or id
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.MEMBER)
    is_active = Column(Boolean, default=False) # Default inactive for new members
    person_id = Column(Integer, ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    person = relationship("Person", back_populates="user")

class FamilyTree(Base):
    __tablename__ = "family_trees"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    persons = relationship("Person", back_populates="family_tree", cascade="all, delete-orphan")
    marriages = relationship("Marriage", back_populates="family_tree", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="family_tree", cascade="all, delete-orphan")

class PersonStatus(str, enum.Enum):
    ALIVE = "ALIVE"
    DECEASED = "DECEASED"
    UNKNOWN = "UNKNOWN"

class Person(Base):
    __tablename__ = "persons"
    
    id = Column(Integer, primary_key=True, index=True)
    family_tree_id = Column(Integer, ForeignKey("family_trees.id", ondelete="CASCADE"), nullable=False)
    
    # Basic Info
    full_name = Column(String, nullable=False)
    other_names = Column(String, nullable=True) # Tên húy, tự
    gender = Column(String, nullable=False) # 'M' or 'F'
    status = Column(Enum(PersonStatus), default=PersonStatus.ALIVE)
    
    # Dates
    solar_birth_date = Column(String, nullable=True)
    lunar_birth_date = Column(String, nullable=True)
    birth_year = Column(Integer, nullable=True)
    
    solar_death_date = Column(String, nullable=True)
    lunar_death_date = Column(String, nullable=True)
    death_year = Column(Integer, nullable=True)
    
    # Details
    job = Column(String, nullable=True)
    origin_place = Column(String, nullable=True) # Quê quán
    birth_place = Column(String, nullable=True)
    death_place = Column(String, nullable=True)
    burial_place = Column(String, nullable=True) # Mộ phần
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Lineage Tree
    generation = Column(Integer, nullable=False, default=1)
    birth_order = Column(Integer, nullable=True)  # 1 = Trưởng, 2 = Thứ, 3 = Ba...
    father_id = Column(Integer, ForeignKey("persons.id", ondelete="SET NULL"), nullable=True)
    mother_id = Column(Integer, ForeignKey("persons.id", ondelete="SET NULL"), nullable=True)
    path = Column(LtreeType, nullable=True) # Optional fast tree querying
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    family_tree = relationship("FamilyTree", back_populates="persons")
    user = relationship("User", back_populates="person", uselist=False)
    
    # Relationship explicitly to fetch children
    # We define children as person where father_id = self.id OR mother_id = self.id.
    # In SQLAlchemy, dynamic relationships like this are complex. It's better to fetch via query.

class MarriageRank(str, enum.Enum):
    MAIN = "VỢ CẢ"
    SECOND = "VỢ THỨ"
    NEXT = "VỢ KẾ"
    HUSBAND = "CHỒNG"
    UNKNOWN = "KHÔNG RÕ"

class Marriage(Base):
    __tablename__ = "marriages"
    
    id = Column(Integer, primary_key=True, index=True)
    family_tree_id = Column(Integer, ForeignKey("family_trees.id", ondelete="CASCADE"), nullable=False)
    husband_id = Column(Integer, ForeignKey("persons.id", ondelete="CASCADE"), nullable=False)
    wife_id = Column(Integer, ForeignKey("persons.id", ondelete="CASCADE"), nullable=False)
    rank = Column(Enum(MarriageRank), default=MarriageRank.MAIN)
    
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    family_tree = relationship("FamilyTree", back_populates="marriages")

class EventType(str, enum.Enum):
    DEATH_ANNIVERSARY = "GIỖ"
    FESTIVAL = "LỄ TẾT"
    MEETING = "HỌP HỌ"
    OTHER = "KHÁC"

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    family_tree_id = Column(Integer, ForeignKey("family_trees.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    event_type = Column(Enum(EventType), default=EventType.OTHER)
    
    lunar_day = Column(Integer, nullable=True)
    lunar_month = Column(Integer, nullable=True)
    is_recurring = Column(Boolean, default=True) # Lặp lại hàng năm
    
    related_person_id = Column(Integer, ForeignKey("persons.id", ondelete="CASCADE"), nullable=True) # Người được cúng giỗ
    description = Column(Text, nullable=True)
    
    family_tree = relationship("FamilyTree", back_populates="events")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    table_name = Column(String, nullable=False)
    record_id = Column(Integer, nullable=False)
    changes = Column(JSONB, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class SiteSetting(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    hero_title = Column(String, default="GIA PHẢ HỌ NGUYỄN")
    hero_subtitle = Column(String, default="Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây")
    hero_image_url = Column(String, default="https://images.unsplash.com/photo-1629851603527-86f777e38711?q=80&w=2070&auto=format&fit=crop")
    about_content = Column(Text, default="Họ Nguyễn là một trong những dòng họ lớn nhất tại Việt Nam. Trang web này được lập ra nhằm lưu giữ và truyền lại gia phả cho các thế hệ mai sau...")
    
    # New CMS fields
    feature1_title = Column(String, default="Ghi chép lịch sử")
    feature1_desc = Column(String, default="Hệ thống lưu trữ phả hệ, gia huấn, và những dấu ấn lịch sử đáng tự hào của các thế hệ cha ông.")
    feature2_title = Column(String, default="Kết nối dòng tộc")
    feature2_desc = Column(String, default="Gắn kết con cháu khắp nơi trên thế giới, cùng nhau hướng về cội nguồn, giữ gìn truyền thống gia phong.")
    feature3_title = Column(String, default="Phả đồ trực quan")
    feature3_desc = Column(String, default="Cây gia phả tương tác thông minh, giúp dễ dàng tra cứu, thêm mới và quan sát tổng thể cấu trúc các thế hệ.")
    
    footer_text = Column(String, default="Hệ thống Quản trị Gia phả DTGen")
    primary_color = Column(String, default="#d97706") # amber-600

