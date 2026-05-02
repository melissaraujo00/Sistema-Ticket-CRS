/**
 * Valores base compartidos para evitar repetición
 */
const baseForm = {
    name: '',
    email: '',
    phone_number: '',
    ext: '',
    birthdate: '',
    department_id: '',
    role: ''
};

/** @type {initialUserFormData} */
export const initialUserFormData = {
    ...baseForm,
    password: ''
};

/** @type {initialUpdateUserFormData} */
export const initialUpdateUserFormData = {
    ...baseForm,
    password: ''
};
