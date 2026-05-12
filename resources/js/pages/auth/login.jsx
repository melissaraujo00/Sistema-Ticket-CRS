import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            {/* Página completa */}
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a0000, #2d0000)',
            }}>
                {/* Tarjeta split */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    width: '700px',
                    height: '480px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                }}>

                    {/* ── LADO IZQUIERDO ── */}
                    <div style={{
                        background: 'white',
                        padding: '44px 40px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
                            Inicia sesión en tu cuenta
                        </h1>
                        <p style={{ fontSize: '13px', color: '#777', marginBottom: '28px' }}>
                            Ingresa tu correo y contraseña para continuar.
                        </p>

                        {status && (
                            <div style={{ marginBottom: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#16a34a' }}>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Correo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <Label htmlFor="email" style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>
                                    Correo
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    style={{
                                        padding: '9px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '7px',
                                        fontSize: '14px',
                                    }}
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Contraseña */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <Label htmlFor="password" style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        padding: '9px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '7px',
                                        fontSize: '14px',
                                    }}
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Recordarme */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked)}
                                    style={{ accentColor: '#CC0000' }}
                                />
                                <Label htmlFor="remember" style={{ fontSize: '13px', color: '#555', cursor: 'pointer' }}>
                                    Recordarme
                                </Label>
                            </div>

                            {/* Botón */}
                            <Button
                                type="submit"
                                tabIndex={4}
                                disabled={processing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: '#CC0000',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '7px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Iniciar sesión
                            </Button>
                        </form>
                    </div>

                    {/* ── LADO DERECHO ── */}
                    <div style={{ position: 'relative', background: 'linear-gradient(135deg, #CC0000, #7a0000)' }}>
                        {/* Overlay con clip-path */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(204,0,0,0.88), rgba(100,0,0,0.97))',
                            clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0% 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            padding: '32px',
                        }}>
                            {/* Logo box */}
                            <div style={{
                                background: 'white',
                                borderRadius: '14px',
                                padding: '18px 22px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                            }}>
                                {/* Cruz SVG */}
                                <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '10px' }}>
                                    <rect x="26" y="6" width="20" height="60" rx="3" fill="#CC0000" />
                                    <rect x="6" y="26" width="60" height="20" rx="3" fill="#CC0000" />
                                </svg>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: '#111',
                                    textAlign: 'center',
                                    letterSpacing: '0.5px',
                                    lineHeight: 1.3,
                                }}>
                                    CRUZ ROJA<br />SALVADOREÑA
                                </span>
                            </div>

                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', letterSpacing: '0.3px' }}>
                                Sistema de Gestión
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}