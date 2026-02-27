from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean
from sqlalchemy.sql import func
from datetime import datetime
from db import Base


# ==========================================================
# PRODUCT REGISTRY (NEW)
# ==========================================================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, index=True)
    normalized_name = Column(String, unique=True, index=True)

    category = Column(String, nullable=True)

    # Play Store metadata
    playstore_id = Column(String, nullable=True)
    playstore_installs = Column(String, nullable=True)
    playstore_rating = Column(Float, nullable=True)

    # Apple App Store metadata
    appstore_id = Column(String, nullable=True)
    appstore_rating = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    active = Column(Boolean, default=True)


# ==========================================================
# RAW SIGNALS
# ==========================================================
class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)

    product = Column(String, index=True)  # keep string for now
    source = Column(String)
    text = Column(Text)
    url = Column(String)
    sentiment = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==========================================================
# WEEKLY SNAPSHOT
# ==========================================================
class WeeklySnapshot(Base):
    __tablename__ = "weekly_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    product = Column(String, index=True)
    week_id = Column(String, index=True)

    pfi_score = Column(Float)
    negative_rate = Column(Float)
    total_signals = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==========================================================
# THEME SNAPSHOT
# ==========================================================
class ThemeSnapshot(Base):
    __tablename__ = "theme_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    product = Column(String, index=True)
    week_id = Column(String, index=True)

    theme_name = Column(String)
    frequency = Column(Integer)
    intensity = Column(Float)