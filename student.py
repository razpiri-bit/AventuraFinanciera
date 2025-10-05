from src.models.user import db
from datetime import datetime
import json

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    nip = db.Column(db.String(6), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    edad = db.Column(db.Integer, nullable=False)
    escuela = db.Column(db.String(200), nullable=False)
    grado = db.Column(db.String(50), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    nombre_tutor = db.Column(db.String(100), nullable=False)
    email_tutor = db.Column(db.String(100), nullable=False)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convierte el objeto a diccionario para JSON"""
        return {
            'id': self.id,
            'nip': self.nip,
            'nombre': self.nombre,
            'apellidos': self.apellidos,
            'nombre_completo': f"{self.nombre} {self.apellidos}",
            'edad': self.edad,
            'escuela': self.escuela,
            'grado': self.grado,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            'nombre_tutor': self.nombre_tutor,
            'email_tutor': self.email_tutor,
            'activo': self.activo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_user_id(self):
        """Devuelve el ID de usuario para el sistema de progreso"""
        return f"student_{self.nip}"

class StudentSession(db.Model):
    __tablename__ = 'student_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    session_start = db.Column(db.DateTime, default=datetime.utcnow)
    session_end = db.Column(db.DateTime)
    duration_minutes = db.Column(db.Integer)
    modules_completed = db.Column(db.Text)  # JSON string
    activities_completed = db.Column(db.Integer, default=0)
    coins_earned = db.Column(db.Integer, default=0)
    
    student = db.relationship('Student', backref=db.backref('sessions', lazy=True))
    
    def get_modules_completed(self):
        """Devuelve la lista de módulos completados en esta sesión"""
        return json.loads(self.modules_completed) if self.modules_completed else []
    
    def set_modules_completed(self, modules_list):
        """Establece la lista de módulos completados en esta sesión"""
        self.modules_completed = json.dumps(modules_list)
    
    def end_session(self):
        """Finaliza la sesión y calcula la duración"""
        self.session_end = datetime.utcnow()
        if self.session_start:
            duration = self.session_end - self.session_start
            self.duration_minutes = int(duration.total_seconds() / 60)
    
    def to_dict(self):
        """Convierte el objeto a diccionario para JSON"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'session_start': self.session_start.isoformat() if self.session_start else None,
            'session_end': self.session_end.isoformat() if self.session_end else None,
            'duration_minutes': self.duration_minutes,
            'modules_completed': self.get_modules_completed(),
            'activities_completed': self.activities_completed,
            'coins_earned': self.coins_earned
        }

