import { useState, useEffect, FormEvent } from 'react';
import { db } from '../../services/db';
import { geminiService } from '../../services/gemini';
import { SystemNotification } from '../../types';
import { Megaphone, Plus, Trash2, Calendar, AlertTriangle, Info, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<SystemNotification>>({
    date: new Date().toISOString().split('T')[0],
    message: '',
    type: 'info',
    targetRole: 'all'
  });

  // AI Loading State
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setNotifications(db.getNotifications());
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Borrar esta notificación?')) {
      db.deleteNotification(id);
      fetchNotifications();
    }
  };

  // Real AI Logic using Gemini
  const handleAIEnhance = async () => {
    if (!formData.message || formData.message.length < 3) {
      alert("Escribe un mensaje base primero.");
      return;
    }

    setIsEnhancing(true);
    
    try {
      const enhancedText = await geminiService.enhanceNotification(formData.message);
      
      setFormData(prev => ({
        ...prev,
        message: enhancedText,
        originalMessage: prev.message // Keep backup just in case
      }));
    } catch (error) {
      alert("No se pudo conectar con la IA. Verifica tu API Key.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.message || !formData.date) return;

    // Date Validation: Cannot be in the past
    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
      alert("No puedes crear notificaciones para fechas pasadas.");
      return;
    }

    const newNote: SystemNotification = {
      id: crypto.randomUUID(),
      date: formData.date,
      message: formData.message,
      type: formData.type as any,
      targetRole: formData.targetRole as any
    };

    db.addNotification(newNote);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      message: '',
      type: 'info',
      targetRole: 'all'
    });
    fetchNotifications();
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'alert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertTriangle size={18} />;
      case 'success': return <CheckCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Megaphone className="text-primary" /> Notificaciones
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Crea anuncios que aparecerán en el dashboard de los usuarios en días específicos.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium"
        >
          <Plus size={18} /> Crear Aviso
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.length > 0 ? (
          notifications.map(note => (
            <div key={note.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-start md:items-center">
              
              <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${getTypeStyles(note.type)}`}>
                {getTypeIcon(note.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Calendar size={12} /> {note.date}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                    {note.targetRole === 'all' ? 'Todos' : note.targetRole}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-white font-medium">{note.message}</p>
              </div>

              <button 
                onClick={() => handleDelete(note.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors self-end md:self-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed dark:border-gray-700">
            <Megaphone className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No hay notificaciones activas.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold dark:text-white">Nueva Notificación</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Visible</label>
                  <input 
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select 
                    className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="info">Información</option>
                    <option value="alert">Alerta / Cierre</option>
                    <option value="success">Evento / Éxito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensaje
                </label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Ej: mañana cerrado por mantenimiento"
                  className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
                
                {/* AI Button */}
                <button 
                  type="button"
                  onClick={handleAIEnhance}
                  disabled={isEnhancing || !formData.message}
                  className="mt-2 text-xs flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Mejorar redacción con Gemini
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 font-bold"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};