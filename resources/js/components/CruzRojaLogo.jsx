import React from 'react';

export const CruzRojaLogo = ({ size = 'medium', className = '' }) => {
    const design = {
        logo: {
            sizes: {
                xs: { width: 32, height: 32 },
                small: { width: 80, height: 100 },
                medium: { width: 120, height: 150 },
                large: { width: 180, height: 220 },
            },
            text: {
                sizes: {
                    xs: '5px',
                    small: '8px',
                    medium: '12px',
                    large: '16px',
                },
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                letterSpacing: '1px',
                lineHeight: '1.2',
            },
            cruz: {
                color: '#DA291C',
            },
            safetyArea: {
                xs: '0px',
                small: '10px',
                medium: '10px',
                large: '10px',
            },
            border: 'none',
        }
    };

    const { width, height } = design.logo.sizes[size];
    const safetyArea = design.logo.safetyArea[size] || '10px';
    const crossSize = width * 0.5;
    const showText = size !== 'xs';

    // Clases condicionales para fondo en modo claro/oscuro solo para xs
    const bgClass = size === 'xs'
        ? 'bg-white dark:bg-gray-800 rounded-md'
        : 'bg-transparent';

    return (
        <div
            className={`inline-flex flex-col items-center justify-center ${bgClass} ${className}`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                padding: safetyArea,
                backgroundColor: size !== 'xs' ? design.logo.background : undefined, // si no es xs, usa transparente
                border: design.logo.border,
            }}
        >
            <div className="relative flex items-center justify-center" style={{ width: crossSize, height: crossSize }}>
                <div
                    className="absolute"
                    style={{
                        width: `${crossSize * 0.3}px`,
                        height: `${crossSize}px`,
                        backgroundColor: design.logo.cruz.color,
                    }}
                />
                <div
                    className="absolute"
                    style={{
                        width: `${crossSize}px`,
                        height: `${crossSize * 0.3}px`,
                        backgroundColor: design.logo.cruz.color,
                    }}
                />
            </div>

            {showText && (
                <div className="mt-3 text-center text-black dark:text-white">
                    <div
                        style={{
                            fontFamily: design.logo.text.fontFamily,
                            fontWeight: design.logo.text.fontWeight,
                            letterSpacing: design.logo.text.letterSpacing,
                            lineHeight: design.logo.text.lineHeight,
                            fontSize: design.logo.text.sizes[size],
                        }}
                    >
                        CRUZ ROJA
                    </div>
                    <div
                        style={{
                            fontFamily: design.logo.text.fontFamily,
                            fontWeight: design.logo.text.fontWeight,
                            letterSpacing: design.logo.text.letterSpacing,
                            lineHeight: design.logo.text.lineHeight,
                            fontSize: design.logo.text.sizes[size],
                        }}
                    >
                        SALVADOREÑA
                    </div>
                </div>
            )}
        </div>
    );
};
