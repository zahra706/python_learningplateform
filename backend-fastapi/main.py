from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from sqlalchemy import DateTime
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import ForeignKeyViolation
import requests
from bs4 import BeautifulSoup
import logging
import google.generativeai as genai
from typing import List
import traceback


# Request headers for web scraping
REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8008",
                   "https://localhost:5173", "https://localhost:3000", "https://localhost:8008"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key="AIzaSyArTPj7-JNKqMgDu0TD0MLG6jp87i-5pZI")

# Database setup (PostgreSQL)
DATABASE_URL = "postgresql://learn_owner:npg_HkeBFbi16PwS@ep-floral-frost-a2isf833-pooler.eu-central-1.aws.neon.tech/wah?sslmode=require"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLAlchemy Models
class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    students = relationship("Student", back_populates="department")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department", back_populates="students")
    formations = relationship("Formation", secondary="student_formations")

class Formation(Base):
    __tablename__ = "formations"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    theme = Column(String)

class StudentFormation(Base):
    __tablename__ = "student_formations"
    student_id = Column(Integer, ForeignKey("students.id"), primary_key=True)
    formation_id = Column(Integer, ForeignKey("formations.id"), primary_key=True)

class RecommendedBook(Base):
    __tablename__ = "recommended_books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    price = Column(Float)
    category = Column(String)
    availability = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

# Create database tables
Base.metadata.create_all(bind=engine)


# Pydantic Models
class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    department_id: int

class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    department_id: int
    department: str | None

    class Config:
        from_attributes = True

class FormationCreate(BaseModel):
    title: str
    theme: str

class FormationResponse(BaseModel):
    id: int
    title: str
    theme: str

    class Config:
        from_attributes = True

class Book(BaseModel):
    title: str
    price: float
    category: str
    availability: str

class DepartmentCreate(BaseModel):
    name: str

class DepartmentResponse(BaseModel):
    id: int
    name: str

# Helper function to validate department
def validate_department(db, department_id: int):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=400, detail=f"Department ID {department_id} does not exist")
    return department

# Endpoints
@app.get("/departments/", response_model=List[DepartmentResponse])
def get_departments():
    """Retrieve all departments from the database"""
    db = SessionLocal()
    try:
        departments = db.query(Department).all()
        return departments
    except Exception as e:
        logger.error(f"Error getting departments: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.post("/departments/", response_model=DepartmentResponse)
def create_department(department: DepartmentCreate):
    db = SessionLocal()
    try:
        db_department = Department(**department.dict())
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        logger.info(f"Created department: {db_department.id}")
        return DepartmentResponse(id=db_department.id, name=db_department.name)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Department name already exists")
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating department: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.post("/students/", response_model=StudentResponse)
def create_student(student: StudentCreate):
    db = SessionLocal()
    try:
        validate_department(db, student.department_id)
        db_student = Student(**student.dict())
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        logger.info(f"Created student: {db_student.id}")
        return StudentResponse(
            id=db_student.id,
            name=db_student.name,
            email=db_student.email,
            department_id=db_student.department_id,
            department=db_student.department.name if db_student.department else None
        )
    except IntegrityError as e:
        db.rollback()
        if isinstance(e.orig, ForeignKeyViolation):
            raise HTTPException(status_code=400, detail=f"Department ID {student.department_id} does not exist")
        if "duplicate key" in str(e):
            raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=400, detail="Database integrity error")
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating student: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/students/", response_model=List[StudentResponse])
def get_all_students():
    db = SessionLocal()
    try:
        students = db.query(Student).join(Department, isouter=True).all()
        return [
            StudentResponse(
                id=s.id,
                name=s.name,
                email=s.email,
                department_id=s.department_id,
                department=s.department.name if s.department else None
            )
            for s in students
        ]
    except Exception as e:
        logger.error(f"Error getting students: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int):
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return StudentResponse(
            id=student.id,
            name=student.name,
            email=student.email,
            department_id=student.department_id,
            department=student.department.name if student.department else None
        )
    except Exception as e:
        logger.error(f"Error getting student: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.post("/formations/", response_model=FormationResponse)
def create_formation(formation: FormationCreate):
    db = SessionLocal()
    try:
        db_formation = Formation(**formation.dict())
        db.add(db_formation)
        db.commit()
        db.refresh(db_formation)
        logger.info(f"Created formation: {db_formation.id}")
        return FormationResponse(id=db_formation.id, title=db_formation.title, theme=db_formation.theme)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating formation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/formations/", response_model=List[FormationResponse])
def get_all_formations():
    db = SessionLocal()
    try:
        formations = db.query(Formation).all()
        return [FormationResponse(id=f.id, title=f.title, theme=f.theme) for f in formations]
    except Exception as e:
        logger.error(f"Error getting formations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.post("/students/{student_id}/enroll/{formation_id}")
def enroll_student(student_id: int, formation_id: int):
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        formation = db.query(Formation).filter(Formation.id == formation_id).first()
        if not student or not formation:
            raise HTTPException(status_code=404, detail="Student or Formation not found")
        student.formations.append(formation)
        db.commit()
        logger.info(f"Enrolled student {student_id} in formation {formation_id}")
        return {"message": "Enrolled successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error enrolling student: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/students/{student_id}/formations")
def get_student_formations(student_id: int):
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return [{"id": f.id, "title": f.title, "theme": f.theme} for f in student.formations]
    except Exception as e:
        logger.error(f"Error getting student formations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

@app.get("/scrape-books")
def scrape_books():
    db = SessionLocal()
    try:
        # List of book URLs to scrape
        book_urls = [
            "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
            "https://books.toscrape.com/catalogue/shakespeares-sonnets_989/index.html",
            "https://books.toscrape.com/catalogue/the-black-maria_991/index.html",
            "https://books.toscrape.com/catalogue/security_925/index.html",
            "https://books.toscrape.com/catalogue/the-secret-of-dreadwillow-carse_944/index.html"
            "https://books.toscrape.com/catalogue/the-bear-and-the-piano_967/index.html",
            "https://books.toscrape.com/catalogue/my-mrs-brown_719/index.html",
            "https://books.toscrape.com/catalogue/take-me-with-you_741/index.html",
            "https://books.toscrape.com/catalogue/the-time-keeper_766/index.html"
        ]
        
        scraped_books = []
        
        # Clear existing books
        db.query(RecommendedBook).delete()
        db.commit()

        for url in book_urls:
            try:
                logger.info(f"Scraping book from {url}")
                response = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
                response.raise_for_status()
                response.encoding = 'utf-8'
                soup = BeautifulSoup(response.text, "html.parser")

                # Extract book details
                title = soup.select_one("h1").text.strip()
                
                # Price extraction
                price_element = soup.select_one("p.price_color")
                if not price_element:
                    logger.warning(f"Price element not found for {url}")
                    continue
                    
                price_text = price_element.text.strip()
                clean_price = ''.join(c for c in price_text if c.isdigit() or c == '.')
                price = float(clean_price)
                
                availability = soup.select_one("p.instock").text.strip() if soup.select_one("p.instock") else "Unknown"
                
                category_elements = soup.select(".breadcrumb li a")
                category = category_elements[2].text.strip() if len(category_elements) > 2 else "Unknown"

                # Add the book to database
                book = RecommendedBook(
                    title=title,
                    price=price,
                    category=category,
                    availability=availability
                )
                db.add(book)
                scraped_books.append({
                    "title": title,
                    "price": price,
                    "category": category,
                    "availability": availability,
                    "url": url
                })
                logger.info(f"Successfully scraped: {title}")

            except requests.RequestException as e:
                logger.error(f"Request failed for {url}: {str(e)}")
                continue
            except Exception as e:
                logger.error(f"Error scraping {url}: {str(e)}")
                logger.error(traceback.format_exc())
                continue

        db.commit()

        return {
            "status": "success",
            "total_books_scraped": len(scraped_books),
            "books": scraped_books
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Scraping failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")
    finally:
        db.close()

@app.get("/recommendations")
def get_recommendations(
    category: str = Query(None, description="Filter by book category"),
    price_min: float = Query(0, description="Minimum price filter"),
    price_max: float = Query(1000, description="Maximum price filter"),
    limit: int = Query(10, description="Number of results to return")
):
    db = SessionLocal()
    try:
        query = db.query(RecommendedBook)
        
        if category:
            query = query.filter(RecommendedBook.category.ilike(f"%{category}%"))
        if price_min is not None:
            query = query.filter(RecommendedBook.price >= price_min)
        if price_max is not None:
            query = query.filter(RecommendedBook.price <= price_max)
        
        books = query.order_by(RecommendedBook.price).limit(limit).all()
        
        if not books:
            logger.warning("No books found with current filters")
            return []
            
        return [{
            "title": b.title,
            "price": b.price,
            "category": b.category,
            "availability": b.availability,
            "created_at": b.created_at
        } for b in books]
        
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve recommendations")
    finally:
        db.close()

@app.get("/scrape-status")
def check_scrape_status():
    db = SessionLocal()
    try:
        count = db.query(RecommendedBook).count()
        last_added = db.query(RecommendedBook).order_by(RecommendedBook.id.desc()).first()
        
        return {
            "total_books": count,
            "last_added": last_added.title if last_added else None,
            "last_added_time": last_added.created_at if last_added else None
        }
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check scrape status")
    finally:
        db.close()

@app.get("/books/summary")
def get_book_summary(title: str = Query(...)):
    db = SessionLocal()
    try:
        book = db.query(RecommendedBook).filter(RecommendedBook.title == title).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Provide a concise summary (100-150 words) of the book '{title}'."
        response = model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate summary")
        
        logger.info(f"Generated summary for book: {title}")
        return {"title": title, "summary": response.text}
    except Exception as e:
        logger.error(f"Error getting book summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)