from src.models.user import db
from datetime import datetime

class HighScore(db.Model):
    __tablename__ = 'high_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    student_nip = db.Column(db.String(6), db.ForeignKey('students.nip'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    module_id = db.Column(db.Integer, nullable=False)
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    student = db.relationship('Student', backref=db.backref('high_scores', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_nip': self.student_nip,
            'score': self.score,
            'module_id': self.module_id,
            'achieved_at': self.achieved_at.isoformat()
        }

