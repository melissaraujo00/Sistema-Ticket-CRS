import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),

    email: z.string().email('Correo inválido'),

    password: z.string().min(8, 'Mínimo 8 caracteres'),

    // Solo dígitos, exactamente 8 caracteres
    phone_number: z
        .string()
        .min(1, 'El teléfono es obligatorio')
        .length(8, 'Debe tener 8 dígitos')
        .refine((val) => /^\d+$/.test(val), 'Solo números'),

    birthdate: z
        .string()
        .min(1, 'La fecha es obligatoria')
        .refine((val) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(val) <= today;
        }, 'La fecha no puede ser mayor a la fecha actual'),

    department_id: z
        .preprocess((val) => {
            if (val === '' || val === null) return null;
            return Number(val);
        }, z.number().nullable())
        .refine((val) => val !== null, {
            message: 'Selecciona un departamento',
        }),

    role: z.enum(['admin', 'agent', 'user'], {
        errorMap: () => ({ message: 'Selecciona un rol' })
    }),

    ext: z
        .preprocess((val) => {
            if (val === '' || val === null) return null;
            return Number(val);
        }, z.number().nullable())
        .optional(),
});

export const updateUserSchema = createUserSchema.omit({ password: true }).extend({
    // Vacío = no cambia; con valor debe cumplir mínimo 8 caracteres
    password: z
        .string()
        .refine((val) => val === '' || val.length >= 8, {
            message: 'Mínimo 8 caracteres',
        })
        .optional(),
});
