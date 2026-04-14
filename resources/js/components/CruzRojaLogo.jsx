import React from 'react';

export const CruzRojaLogo = ({ size = 'medium' }) => {
    const design = {
        logo: {
            sizes: {
                small: { width: 80, height: 100 },
                medium: { width: 120, height: 150 },
                large: { width: 180, height: 220 },
            },
            text: {
                sizes: {
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
                color: '#DA291C', // Rojo oficial
            },
            background: 'transparent',
            safetyArea: '10px',
            border: 'none',
        }
    };

    const { width, height } = design.logo.sizes[size];
    const crossSize = width * 0.5;

    return (
        <div
            className="inline-flex flex-col items-center justify-center"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                padding: design.logo.safetyArea,
                backgroundColor: design.logo.background,
                border: design.logo.border,
            }}
        >
            {/* Cruz Roja (SVG o Divs) */}
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

            {/* Texto Institucional */}
            <div className="mt-3 text-center text-black">
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
        </div>
    );
};
