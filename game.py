from flask import Blueprint, request, jsonify
from src.models.game_progress import db, GameProgress, ModuleActivity
from src.models.high_score import HighScore
from datetime import datetime
import uuid

game_bp = Blueprint('game', __name__)

# Configuración de módulos del juego
MODULES_CONFIG = [
    {
        'id': 1,
        'title': 'Puerto del Descubrimiento',
        'subtitle': 'El Mundo de las Finanzas',
        'coins_reward': 20,
        'difficulty': 'Fácil'
    },
    {
        'id': 2,
        'title': 'Valle de los Ingresos y Gastos',
        'subtitle': '¿De Dónde Viene y a Dónde Va?',
        'coins_reward': 25,
        'difficulty': 'Fácil'
    },
    {
        'id': 3,
        'title': 'Cueva del Ahorro',
        'subtitle': 'La Magia del Ahorro',
        'coins_reward': 30,
        'difficulty': 'Medio'
    },
    {
        'id': 4,
        'title': 'Mercado del Emprendedor',
        'subtitle': 'Tu Propio Negocio',
        'coins_reward': 35,
        'difficulty': 'Medio'
    },
    {
        'id': 5,
        'title': 'Bosque de la Honestidad',
        'subtitle': 'La Ética en los Negocios',
        'coins_reward': 40,
        'difficulty': 'Medio'
    },
    {
        'id': 6,
        'title': 'Fuente del Crecimiento',
        'subtitle': 'El Poder de la Inversión',
        'coins_reward': 45,
        'difficulty': 'Difícil'
    },
    {
        'id': 7,
        'title': 'Montañas de los Desafíos',
        'subtitle': 'Los Obstáculos y Cómo Superarlos',
        'coins_reward': 50,
        'difficulty': 'Difícil'
    },
    {
        'id': 8,
        'title': 'Cima del Éxito',
        'subtitle': 'Hacia el Éxito Financiero',
        'coins_reward': 100,
        'difficulty': 'Maestro'
    }
]

@game_bp.route('/progress/<user_id>', methods=['GET'])
def get_user_progress(user_id):
    """Obtiene el progreso del usuario"""
    try:
        progress = GameProgress.query.filter_by(user_id=user_id).first()
        
        if not progress:
            # Crear nuevo progreso para el usuario
            progress = GameProgress(user_id=user_id)
            db.session.add(progress)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': progress.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@game_bp.route('/progress/<user_id>', methods=['POST'])
def update_user_progress(user_id):
    """Actualiza el progreso del usuario"""
    try:
        data = request.get_json()
        progress = GameProgress.query.filter_by(user_id=user_id).first()
        
        if not progress:
            progress = GameProgress(user_id=user_id)
            db.session.add(progress)
        
        # Actualizar campos si están presentes en los datos
        if 'coins' in data:
            progress.coins = data['coins']
        if 'level' in data:
            progress.level = data['level']
        if 'completed_modules' in data:
            progress.set_completed_modules(data['completed_modules'])
        if 'badges' in data:
            progress.set_badges(data['badges'])
        if 'current_module' in data:
            progress.current_module = data['current_module']
        
        progress.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': progress.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@game_bp.route('/complete-module/<user_id>/<int:module_id>', methods=['POST'])
def complete_module(user_id, module_id):
    """Marca un módulo como completado y otorga recompensas"""
    try:
        data = request.get_json() or {}
        score = data.get('score', 0)
        
        progress = GameProgress.query.filter_by(user_id=user_id).first()
        if not progress:
            progress = GameProgress(user_id=user_id)
            db.session.add(progress)
        
        # Verificar si el módulo existe
        module_config = next((m for m in MODULES_CONFIG if m['id'] == module_id), None)
        if not module_config:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Añadir módulo completado
        progress.add_completed_module(module_id)
        
        # Otorgar monedas
        coins_earned = module_config['coins_reward']
        if score >= 80:  # Bonus por buen desempeño
            coins_earned = int(coins_earned * 1.5)
        progress.add_coins(coins_earned)
        
        # Otorgar insignias según el progreso
        completed_modules = progress.get_completed_modules()
        if len(completed_modules) == 1:
            progress.add_badge('Primer Paso')
        elif len(completed_modules) == 4:
            progress.add_badge('Explorador Intermedio')
        elif len(completed_modules) == 8:
            progress.add_badge('Maestro Financiero')
        
        # Subir de nivel cada 3 módulos completados
        new_level = (len(completed_modules) // 3) + 1
        progress.level = max(progress.level, new_level)
        
        progress.updated_at = datetime.utcnow()
        # Guardar high score para el módulo
        high_score = HighScore(
            student_nip=user_id.replace('student_', ''),
            score=score,
            module_id=module_id
        )
        db.session.add(high_score)

        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': progress.to_dict(),
            'coins_earned': coins_earned,
            'new_badges': progress.get_badges()[-1:] if len(progress.get_badges()) > 0 else []
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@game_bp.route('/activity/<user_id>', methods=['POST'])
def save_activity(user_id):
    """Guarda una actividad del usuario"""
    try:
        data = request.get_json()
        
        activity = ModuleActivity(
            user_id=user_id,
            module_id=data.get('module_id'),
            activity_type=data.get('activity_type'),
            score=data.get('score', 0),
            completed=data.get('completed', False)
        )
        
        if 'activity_data' in data:
            activity.set_activity_data(data['activity_data'])
        
        if data.get('completed'):
            activity.completed_at = datetime.utcnow()
        
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': activity.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@game_bp.route('/activities/<user_id>', methods=['GET'])
def get_user_activities(user_id):
    """Obtiene todas las actividades del usuario"""
    try:
        activities = ModuleActivity.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'success': True,
            'data': [activity.to_dict() for activity in activities]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@game_bp.route('/modules', methods=['GET'])
def get_modules():
    """Obtiene la configuración de todos los módulos"""
    return jsonify({
        'success': True,
        'data': MODULES_CONFIG
    })

@game_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Obtiene el ranking de usuarios por monedas"""
    try:
        top_users = GameProgress.query.order_by(GameProgress.coins.desc()).limit(10).all()
        
        leaderboard = []
        for i, user in enumerate(top_users, 1):
            leaderboard.append({
                'rank': i,
                'user_id': user.user_id,
                'coins': user.coins,
                'level': user.level,
                'completed_modules': len(user.get_completed_modules())
            })
        
        return jsonify({
            'success': True,
            'data': leaderboard
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@game_bp.route('/reset/<user_id>', methods=['POST'])
def reset_user_progress(user_id):
    """Reinicia el progreso del usuario (para testing)"""
    try:
        progress = GameProgress.query.filter_by(user_id=user_id).first()
        if progress:
            db.session.delete(progress)
        
        # Eliminar actividades del usuario
        ModuleActivity.query.filter_by(user_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Progreso reiniciado exitosamente'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



@game_bp.route("/highscores", methods=["GET"])
def get_highscores():
    """Obtiene los high scores de todos los módulos"""
    try:
        # Obtener los high scores únicos por estudiante y módulo
        # Esto es un poco más complejo ya que queremos el score más alto por cada estudiante en cada módulo
        # Una forma de hacerlo es agrupar por student_nip y module_id y seleccionar el max score
        # Sin embargo, para un leaderboard general, podemos simplemente mostrar los top scores globales
        # o los top scores por módulo.
        # Para este caso, vamos a mostrar los top 10 scores globales, independientemente del módulo.
        
        # Si queremos el score más alto por estudiante en cada módulo:
        # subquery = db.session.query(
        #     HighScore.student_nip,
        #     HighScore.module_id,
        #     db.func.max(HighScore.score).label("max_score")
        # ).group_by(HighScore.student_nip, HighScore.module_id).subquery()
        # 
        # high_scores = db.session.query(HighScore).join(
        #     subquery,
        #     db.and_(
        #         HighScore.student_nip == subquery.c.student_nip,
        #         HighScore.module_id == subquery.c.module_id,
        #         HighScore.score == subquery.c.max_score
        # )).order_by(HighScore.score.desc()).limit(10).all()

        # Para un leaderboard simple de los 10 mejores scores generales:
        high_scores = HighScore.query.order_by(HighScore.score.desc()).limit(10).all()
        
        leaderboard = []
        for i, hs in enumerate(high_scores, 1):
            leaderboard.append({
                "rank": i,
                "student_nip": hs.student_nip,
                "score": hs.score,
                "module_id": hs.module_id,
                "achieved_at": hs.achieved_at.isoformat()
            })
        
        return jsonify({
            "success": True,
            "data": leaderboard
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


