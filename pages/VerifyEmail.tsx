import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { sendSchoolEmail } from '../services/mailer';
import { CheckCircle, XCircle, Loader2, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Simulate network check
    setTimeout(() => {
      const result = db.verifyUser(token);
      
      if (result.status === 'success') {
        setStatus('success');
        refreshUser(); 
      } else if (result.status === 'expired') {
        setStatus('expired');
      } else {
        setStatus('error');
      }
    }, 1500);
  }, [token, refreshUser]);

  const handleStart = () => {
    navigate(user ? '/student/dashboard' : '/login');
  };

  const handleResend = async () => {
    // Try to find user from context, or we might need to ask for email if not logged in.
    // For this flow, we assume the user is likely clicking the link on the same device or we can't easily resend without email.
    // Ideally, we would decode the token to get the email, but our simple implementation doesn't support that.
    // If user is logged in (session exists but unverified), we use that email.
    
    if (!user) {
      alert("Por seguridad, inicia sesión para solicitar un nuevo correo de verificación.");
      navigate('/login');
      return;
    }

    setIsResending(true);
    const result = db.resendVerificationToken(user.email);
    
    if (result.success && result.token) {
        const link = `${window.location.origin}/#/verify?token=${result.token}`;
        const html = `
          <h1>Nuevo enlace de verificación</h1>
          <p>El enlace anterior expiró. Usa este nuevo link:</p>
          <a href="${link}">Verificar Cuenta</a>
        `;
        await sendSchoolEmail(user.email, 'Nuevo enlace de verificación - EduEats', html);
        alert('Se ha enviado un nuevo enlace a tu correo.');
        navigate('/pending-verify'); // Redirect back to pending screen
    } else {
        alert('Error al reenviar el correo.');
    }
    setIsResending(false);
  };

  const isPrimary = user?.grade && user.grade <= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="w-full max-w-md">
        
        {status === 'loading' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
            <Loader2 className="animate-spin text-primary mb-4 mx-auto" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verificando...</h2>
            <p className="text-gray-500 dark:text-gray-400">Validando token de seguridad.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">🥳</div>
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                ¡Cuenta Activada!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu registro en <strong>EduEats</strong> ha sido exitoso.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl text-left mb-6 border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} /> Todo listo
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Ya puedes acceder al menú semanal y realizar tus pedidos.
                </p>
              </div>

              {isPrimary && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm mb-6 font-medium">
                  🎒 ¡Pide ayuda a tus papás o profes si tienes dudas con la app!
                </div>
              )}

              <button 
                onClick={handleStart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                Ir al Dashboard <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-full mb-4 inline-flex">
              <Clock className="text-amber-600 dark:text-amber-400" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Enlace Expirado</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Por seguridad, los enlaces de verificación solo duran 24 horas.
            </p>
            
            {user ? (
               <button 
                onClick={handleResend}
                disabled={isResending}
                className="w-full bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isResending ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                Reenviar Correo
              </button>
            ) : (
               <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
                  Inicia sesión nuevamente para solicitar un nuevo enlace.
               </div>
            )}
           
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 text-gray-500 hover:underline text-sm"
            >
              Volver al Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4 inline-flex">
              <XCircle className="text-red-600 dark:text-red-400" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Token Inválido</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Este enlace no existe o ya fue utilizado.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Volver al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};