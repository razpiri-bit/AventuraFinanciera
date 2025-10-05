from src.models.user import db
from datetime import datetime
import json

class GameProgress(db.Model):
    __tablename__ = 'game_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, unique=True)
    coins = db.Column(db.Integer, default=100)
    level = db.Column(db.Integer, default=1)
    completed_modules = db.Column(db.Text, default='[]')  # JSON string
    badges = db.Column(db.Text, default='[]')  # JSON string
    current_module = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_completed_modules(self):
        """Devuelve la lista de módulos completados"""
        return json.loads(self.completed_modules) if self.completed_modules else []
    
    def set_completed_modules(self, modules_list):
        """Establece la lista de módulos completados"""
        self.completed_modules = json.dumps(modules_list)
    
    def get_badges(self):
        """Devuelve la lista de insignias"""
        return json.loads(self.badges) if self.badges else []
    
    def set_badges(self, badges_list):
        """Establece la lista de insignias"""
        self.badges = json.dumps(badges_list)
    
    def add_completed_module(self, module_id):
        """Añade un módulo a la lista de completados"""
        completed = self.get_completed_modules()
        if module_id not in completed:
            completed.append(module_id)
            self.set_completed_modules(completed)
    
    def add_badge(self, badge_name):
        """Añade una insignia"""
        badges = self.get_badges()
        if badge_name not in badges:
            badges.append(badge_name)
            self.set_badges(badges)
    
    def add_coins(self, amount):
        """Añade monedas al total"""
        self.coins += amount
    
    def spend_coins(self, amount):
        """Gasta monedas si hay suficientes"""
        if self.coins >= amount:
            self.coins -= amount
            return True
        return False
    
    def to_dict(self):
        """Convierte el objeto a diccionario para JSON"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'coins': self.coins,
            'level': self.level,
            'completed_modules': self.get_completed_modules(),
            'badges': self.get_badges(),
            'current_module': self.current_module,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ModuleActivity(db.Model):
    __tablename__ = 'module_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    module_id = db.Column(db.Integer, nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # 'quiz', 'game', 'decision'
    activity_data = db.Column(db.Text)  # JSON string con datos específicos de la actividad
    score = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_activity_data(self):
        """Devuelve los datos de la actividad"""
        return json.loads(self.activity_data) if self.activity_data else {}
    
    def set_activity_data(self, data):
        """Establece los datos de la actividad"""
        self.activity_data = json.dumps(data)
    
    def to_dict(self):
        """Convierte el objeto a diccionario para JSON"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module_id': self.module_id,
            'activity_type': self.activity_type,
            'activity_data': self.get_activity_data(),
            'score': self.score,
            'completed': self.completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

