import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar Sesión" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .login-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    font-family: 'DM Sans', sans-serif;
                    padding: 1rem;
                }

                .login-card {
                    display: flex;
                    width: 100%;
                    max-width: 820px;
                    min-height: 480px;
                    border-radius: 22px;
                    overflow: hidden;
                    background: #fff;
                    box-shadow:
                        0 35px 80px rgba(0,0,0,0.55),
                        0 0 0 1px rgba(255,255,255,0.04);
                    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
                }

                @keyframes cardIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* ───────── LEFT SIDE ───────── */

                .login-left {
                    flex: 1;
                    background: #ffffff;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 2.4rem 2.8rem;
                    position: relative;
                }

                .login-left::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 5px;
                    height: 100%;
                    background: #DA291C;
                }

                .login-heading {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 2.2rem;
                    color: #111;
                    letter-spacing: 1px;
                    margin-bottom: 0.2rem;
                }

                .login-sub {
                    font-size: 0.78rem;
                    color: #777;
                    margin-bottom: 1.8rem;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .field-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    color: #444;
                    margin-bottom: 0.35rem;
                    display: block;
                }

                .field-wrapper {
                    position: relative;
                }

                .field-icon {
                    position: absolute;
                    left: 13px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 15px;
                    height: 15px;
                    color: #999;
                    pointer-events: none;
                }

                .field-input {
                    width: 100%;
                    padding: 0.72rem 0.9rem 0.72rem 2.5rem;
                    border-radius: 10px;
                    border: 1.5px solid #e5e5e5;
                    background: #fafafa;
                    font-size: 0.86rem;
                    font-family: 'DM Sans', sans-serif;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .field-input:focus {
                    border-color: #DA291C;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(218,41,28,0.08);
                }

                .field-input::placeholder {
                    color: #c4c4c4;
                }

                .eye-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .eye-btn:hover {
                    color: #DA291C;
                }

                .remember-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 0.3rem 0 1.3rem;
                }

                .remember-left {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                }

                .remember-label {
                    font-size: 0.78rem;
                    color: #666;
                }

                .forgot-link {
                    font-size: 0.76rem;
                    color: #DA291C;
                    text-decoration: none;
                    font-weight: 600;
                }

                .forgot-link:hover {
                    text-decoration: underline;
                }

                .submit-btn {
                    width: 100%;
                    padding: 0.82rem;
                    border: none;
                    border-radius: 12px;
                    background: #DA291C;
                    color: white;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1rem;
                    letter-spacing: 2px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    transition: all 0.2s ease;
                    box-shadow: 0 10px 25px rgba(218,41,28,0.30);
                }

                .submit-btn:hover:not(:disabled) {
                    background: #bc1d13;
                    transform: translateY(-2px);
                    box-shadow: 0 14px 28px rgba(218,41,28,0.40);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .status-msg {
                    margin-top: 1rem;
                    text-align: center;
                    font-size: 0.82rem;
                    color: #16a34a;
                    font-weight: 500;
                }

                /* ───────── RIGHT SIDE ───────── */

                .login-right {
                    width: 320px;
                    background: linear-gradient(180deg, #DA291C 0%, #b6160d 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .login-right::before {
                    content: '';
                    position: absolute;
                    width: 260px;
                    height: 260px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.06);
                    top: -80px;
                    right: -80px;
                }

                .login-right::after {
                    content: '';
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.08);
                    bottom: -50px;
                    left: -50px;
                }

                .logo-card {
                    background: #ffffff;
                    border-radius: 18px;
                    padding: 1rem;
                    border: 4px solid #111;
                    box-shadow:
                        0 25px 50px rgba(0,0,0,0.28),
                        0 0 0 1px rgba(255,255,255,0.1);
                    position: relative;
                    z-index: 2;
                    animation: logoIn 0.7s ease;
                }

                @keyframes logoIn {
                    from {
                        opacity: 0;
                        transform: scale(0.85);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .logo-img {
                    width: 220px;
                    height: auto;
                    display: block;
                    object-fit: contain;
                    user-select: none;
                }

                .system-label {
                    margin-top: 1.5rem;
                    color: rgba(255,255,255,0.82);
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 300;
                    position: relative;
                    z-index: 2;
                }

                @media (max-width: 768px) {
                    .login-card {
                        flex-direction: column;
                        max-width: 420px;
                    }

                    .login-right {
                        width: 100%;
                        padding: 2rem 1.5rem;
                    }

                    .logo-img {
                        width: 170px;
                    }

                    .login-left {
                        padding: 2rem;
                    }

                    .login-heading {
                        font-size: 1.9rem;
                    }
                }
            `}</style>

            <div className="login-root">
                <div className="login-card">

                    {/* ───────── FORMULARIO ───────── */}
                    <div className="login-left">

                        <h1 className="login-heading">
                            Iniciar Sesión
                        </h1>

                        <p className="login-sub">
                            Ingresa tus credenciales para continuar
                        </p>

                        <form onSubmit={submit}>

                            <div className="field-group">

                                {/* EMAIL */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="field-label"
                                    >
                                        Correo electrónico
                                    </label>

                                    <div className="field-wrapper">
                                        <Mail className="field-icon" />

                                        <input
                                            id="email"
                                            type="email"
                                            className="field-input"
                                            placeholder="correo@ejemplo.com"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            tabIndex={1}
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />
                                    </div>

                                    <InputError message={errors.email} />
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="field-label"
                                    >
                                        Contraseña
                                    </label>

                                    <div className="field-wrapper">
                                        <Lock className="field-icon" />

                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="field-input"
                                            placeholder="••••••••"
                                            required
                                            autoComplete="current-password"
                                            tabIndex={2}
                                            value={data.password}
                                            onChange={(e) =>
                                                setData('password', e.target.value)
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword
                                                ? <EyeOff size={16} />
                                                : <Eye size={16} />
                                            }
                                        </button>
                                    </div>

                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            {/* RECORDAR */}
                            <div className="remember-row">

                                <div className="remember-left">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData('remember', checked)
                                        }
                                    />

                                    <label
                                        htmlFor="remember"
                                        className="remember-label"
                                    >
                                        Recordarme
                                    </label>
                                </div>

                                {/* {canResetPassword && (
                                    <TextLink
                                        href={route('password.request')}
                                        className="forgot-link"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </TextLink>
                                )} */}
                            </div>

                            {/* BOTÓN */}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={processing}
                            >
                                {processing && (
                                    <LoaderCircle
                                        size={18}
                                        style={{
                                            animation:
                                                'spin 1s linear infinite',
                                        }}
                                    />
                                )}

                                Iniciar sesión
                            </button>

                        </form>

                        {status && (
                            <div className="status-msg">
                                {status}
                            </div>
                        )}
                    </div>

                    {/* ───────── LOGO ───────── */}
                    <div className="login-right">

                        <div className="logo-card">
                            <img
                                src="/img_cruzroja.jpeg"
                                alt="Cruz Roja Salvadoreña"
                                className="logo-img"
                                draggable={false}
                            />  
                        </div>

                        <p className="system-label">
                            Sistema de Gestión
                        </p>

                    </div>

                </div>
            </div>
        </>
    );
}