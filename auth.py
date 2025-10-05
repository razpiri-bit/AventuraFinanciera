from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.student import Student, StudentSession
from src.models.game_progress import GameProgress
from datetime import datetime, date
import re

auth_bp = Blueprint('auth', __name__)

def generate_nip(nombre, apellidos, fecha_nacimiento):
    """Genera un NIP basado en iniciales y fecha de nacimiento"""
    # Obtener iniciales (primera letra del nombre y primera del primer apellido)
    iniciales = (nombre[0] + apellidos.split(' ')[0][0]).upper()
    
    # Obtener fecha en formato DDMM
    # Asegurarse de que fecha_nacimiento sea un objeto date
    if isinstance(fecha_nacimiento, str):
        fecha = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
    else:
        fecha = fecha_nacimiento
    
    dia = fecha.day
    mes = fecha.month
    
    return f"{iniciales}{dia:02d}{mes:02d}"

def validate_email(email):
    """Valida el formato del email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register_student():
    """Registra un nuevo estudiante"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['nombre', 'apellidos', 'edad', 'escuela', 'grado', 
                          'fechaNacimiento', 'nombreTutor', 'emailTutor']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'El campo {field} es requerido'
                }), 400
        
        # Validar edad
        edad = int(data['edad'])
        if edad < 6 or edad > 17:
            return jsonify({
                'success': False,
                'error': 'La edad debe estar entre 6 y 17 años'
            }), 400
        
        # Validar email
        if not validate_email(data['emailTutor']):
            return jsonify({
                'success': False,
                'error': 'El email del tutor no es válido'
            }), 400
        
        # Generar NIP
        nip = generate_nip(data['nombre'], data['apellidos'], data['fechaNacimiento'])
        
        # Verificar si el NIP ya existe
        existing_student = Student.query.filter_by(nip=nip).first()
        if existing_student:
            # Si el NIP ya existe, intentar generar uno alternativo (ej. añadiendo un número)
            # Para este caso, simplemente informamos que ya existe y el usuario debe contactar al admin
            return jsonify({
                'success': False,
                'error': 'Ya existe un estudiante con este NIP. Por favor, verifica tus datos o contacta al administrador.'
            }), 400
        
        # Convertir fecha de nacimiento
        fecha_nacimiento = datetime.strptime(data['fechaNacimiento'], '%Y-%m-%d').date()
        
        # Crear nuevo estudiante
        student = Student(
            nip=nip,
            nombre=data['nombre'].strip(),
            apellidos=data['apellidos'].strip(),
            edad=edad,
            escuela=data['escuela'].strip(),
            grado=data['grado'],
            fecha_nacimiento=fecha_nacimiento,
            nombre_tutor=data['nombreTutor'].strip(),
            email_tutor=data['emailTutor'].strip().lower()
        )
        
        db.session.add(student)
        db.session.commit()
        
        # Crear progreso inicial del juego
        user_id = student.get_user_id()
        progress = GameProgress(user_id=user_id)
        db.session.add(progress)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'student': student.to_dict(),
                'nip': nip
            },
            'message': 'Estudiante registrado exitosamente'
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'Formato de fecha inválido'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/login/<nip>', methods=['GET'])
def login_student(nip):
    """Inicia sesión con el NIP del estudiante"""
    try:
        # Validar formato del NIP
        if len(nip) != 6:
            return jsonify({
                'success': False,
                'error': 'El NIP debe tener 6 caracteres'
            }), 400
        
        # Buscar estudiante
        student = Student.query.filter_by(nip=nip.upper(), activo=True).first()
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'NIP no encontrado o cuenta inactiva'
            }), 404
        
        # Crear nueva sesión
        session = StudentSession(student_id=student.id)
        db.session.add(session)
        db.session.commit()
        
        # Obtener progreso del juego
        user_id = student.get_user_id()
        progress = GameProgress.query.filter_by(user_id=user_id).first()
        
        if not progress:
            # Crear progreso si no existe
            progress = GameProgress(user_id=user_id)
            db.session.add(progress)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'user': {
                'student': student.to_dict(),
                'progress': progress.to_dict(),
                'session_id': session.id
            },
            'message': 'Inicio de sesión exitoso'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/logout/<int:session_id>', methods=['POST'])
def logout_student(session_id):
    """Cierra la sesión del estudiante"""
    try:
        session = StudentSession.query.get(session_id)
        
        if not session:
            return jsonify({
                'success': False,
                'error': 'Sesión no encontrada'
            }), 404
        
        # Actualizar datos de la sesión
        data = request.get_json() or {}
        
        if 'modules_completed' in data:
            session.set_modules_completed(data['modules_completed'])
        if 'activities_completed' in data:
            session.activities_completed = data['activities_completed']
        if 'coins_earned' in data:
            session.coins_earned = data['coins_earned']
        
        # Finalizar sesión
        session.end_session()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': session.to_dict(),
            'message': 'Sesión cerrada exitosamente'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/student/<nip>', methods=['GET'])
def get_student_info(nip):
    """Obtiene información del estudiante por NIP"""
    try:
        student = Student.query.filter_by(nip=nip.upper(), activo=True).first()
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Estudiante no encontrado'
            }), 404
        
        # Obtener estadísticas de sesiones
        total_sessions = StudentSession.query.filter_by(student_id=student.id).count()
        total_time = db.session.query(db.func.sum(StudentSession.duration_minutes)).filter_by(student_id=student.id).scalar() or 0
        
        # Obtener progreso del juego
        user_id = student.get_user_id()
        progress = GameProgress.query.filter_by(user_id=user_id).first()
        
        return jsonify({
            'success': True,
            'data': {
                'student': student.to_dict(),
                'progress': progress.to_dict() if progress else None,
                'statistics': {
                    'total_sessions': total_sessions,
                    'total_time_minutes': total_time,
                    'average_session_time': round(total_time / total_sessions, 1) if total_sessions > 0 else 0
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/students', methods=['GET'])
def list_students():
    """Lista todos los estudiantes registrados (para administradores)"""
    try:
        students = Student.query.filter_by(activo=True).order_by(Student.created_at.desc()).all()
        
        students_data = []
        for student in students:
            # Obtener progreso
            user_id = student.get_user_id()
            progress = GameProgress.query.filter_by(user_id=user_id).first()
            
            # Obtener estadísticas básicas
            total_sessions = StudentSession.query.filter_by(student_id=student.id).count()
            
            student_info = student.to_dict()
            student_info['progress'] = progress.to_dict() if progress else None
            student_info['total_sessions'] = total_sessions
            
            students_data.append(student_info)
        
        return jsonify({
            'success': True,
            'data': students_data,
            'total': len(students_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

