import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { TriangleAlert } from "lucide-react";
import * as Yup from "yup";

//  Schema de validación compartido 
const calificacionSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, "Debes seleccionar al menos una estrella.")
    .required("La calificación es requerida."),
  comentario: Yup.string()
    .trim()
    .min(10, "El comentario debe tener al menos 10 caracteres.")
    .required("El comentario es requerido."),
});

//Hook de validación reutilizable
function useCalificacionForm(isOpen, ticket) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComentario("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, ticket?.id]);

  // Validar en tiempo real para habilitar/deshabilitar el botón
  const isFormValid =
    rating > 0 && comentario.trim().length >= 10 && !isSubmitting;

  // Validar con Yup y mostrar errores inline
  const validate = async () => {
    try {
      await calificacionSchema.validate(
        { rating, comentario },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((e) => {
        fieldErrors[e.path] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  // Limpiar error de un campo al escribir
  const handleComentarioChange = (e) => {
    setComentario(e.target.value);
    if (errors.comentario) {
      setErrors((prev) => ({ ...prev, comentario: undefined }));
    }
  };

  const handleRatingChange = (star) => {
    setRating(star);
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: undefined }));
    }
  };

  return {
    rating,
    comentario,
    errors,
    isSubmitting,
    setIsSubmitting,
    isFormValid,
    validate,
    handleComentarioChange,
    handleRatingChange,
  };
}

//Sección de estrellas reutilizable
function StarRating({ rating, onChange, error }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-2xl mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onChange(star)}
            className={`cursor-pointer transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
          >
            ★
          </span>
        ))}
        <span className="text-sm ml-2">{rating}/5</span>
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// Textarea con contador y error inline 
function ComentarioTextarea({ value, onChange, error }) {
  const count = value.trim().length;
  return (
    <div>
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full border rounded-md p-2 h-24 text-sm resize-none focus:outline-none focus:ring-1 ${error
          ? "border-red-400 focus:ring-red-400"
          : "border-gray-300 focus:ring-red-400"
          }`}
        placeholder="Escribe tu comentario (mínimo 10 caracteres)..."
      />
      <div className="flex justify-between items-center mt-0.5">
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <span />
        )}
        <span
          className={`text-xs ml-auto ${count >= 10 ? "text-green-600" : "text-gray-400"
            }`}
        >
          {count} caracteres
        </span>
      </div>
    </div>
  );
}

// Botón Enviar con estado de carga 
function SubmitButton({ isFormValid, isSubmitting, onClick }) {
  const disabled = !isFormValid || isSubmitting;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm rounded-md w-40 text-white flex items-center justify-center gap-2 transition-colors ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
        }`}
    >
      {isSubmitting ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Enviando...
        </>
      ) : (
        "Enviar"
      )}
    </button>
  );
}

//Componente principal
export default function TicketRatingModal({ isOpen, onClose, ticket, onNext }) {
  const form = useCalificacionForm(isOpen, ticket);

  if (!isOpen || !ticket) return null;

  // Lógica de envío compartida
  const buildHandleEnviar = () => async () => {
    const valid = await form.validate();
    if (!valid) return;

    form.setIsSubmitting(true); // 🔒 Bloquea el botón inmediatamente
    try {
      await axios.post("/qualifications", {
        score: form.rating,
        comment: form.comentario,
        ticket_id: ticket?.id,
      });

      Swal.fire({
        icon: "success",
        title: "Calificación enviada",
        text: "La calificación se registró correctamente.",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        onNext();
      });
    } catch (error) {
      form.setIsSubmitting(false); // 🔓 Desbloquea si hay error para reintentar
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la calificación",
      });
    } finally {
      form.setIsSubmitting(false)
    }
  };

  // Vista para ticket status 7 
  if (ticket?.status?.id === 7) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
          <div className="bg-red-600 text-white text-center py-1">
            <h1 className="text-lg font-bold">Tu Ticket se resolvio</h1>
            <p className="text-xs">Sistema de Tickets Cruz Roja</p>
          </div>

          <div className="p-5 space-y-5">
            <div className="border rounded-md p-3 bg-gray-50">
              <h2 className="font-semibold mb-2 text-sm">Información del Ticket</h2>
              <div className="grid grid-cols-2 text-xs gap-y-1">
                <p><strong>Ticket:</strong> #{ticket?.code}</p>
                <p><strong>Departamento:</strong> {ticket?.department?.name ?? "N/A"}</p>
                <p><strong>Problema:</strong> {ticket?.subject ?? "N/A"}</p>
                <p><strong>Estado:</strong> {ticket?.status?.name}</p>
                <p><strong>Técnico:</strong> {ticket?.assigned_user?.name ?? "N/A"}</p>
                <p>
                  <strong>Fecha de actualización:</strong>{" "}
                  {new Date(ticket?.updated_at).toLocaleDateString("es-SV")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">

              <div className="mt-0.5">
                <TriangleAlert className="h-5 w-5 text-amber-600 shrink-0" />
              </div>

              <div className="text-xs text-amber-800 space-y-1">

                <p className="font-semibold">
                  Este problema no pudo resolverse en esta visita.
                </p>

                <p>
                  Se requiere adquirir un componente nuevo para completar la reparación.
                </p>

                <p>
                  Cuando el componente esté disponible deberás abrir un nuevo ticket.
                </p>

              </div>
            </div>

            <div className="border rounded-md p-2 space-y-1">
              <h2 className="text-sm font-semibold">Calificación</h2>
              <StarRating
                rating={form.rating}
                onChange={form.handleRatingChange}
                error={form.errors.rating}
              />
              <ComentarioTextarea
                value={form.comentario}
                onChange={form.handleComentarioChange}
                error={form.errors.comentario}
              />
            </div>

            <div className="flex justify-center gap-2">
              <SubmitButton
                isFormValid={form.isFormValid}
                isSubmitting={form.isSubmitting}
                onClick={buildHandleEnviar()}
              />
              <button
                onClick={onClose}
                disabled={form.isSubmitting}
                className="px-4 py-2 text-sm rounded-md w-40 border disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista normal 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">

      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden ">
        {/* HEADER LATERAL */}

        <div className="bg-red-600 text-white text-center py-1">
          <h1 className="text-lg font-bold">Tu Ticket se resolvio</h1>
          <p className="text-xs">Sistema de Tickets Cruz Roja</p>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[90vh]">

          <div className="grid grid-cols-1  gap-4 ">

            {/* INFO */}
            <div className="border rounded-md p-3 bg-gray-50">
              <h2 className="font-semibold mb-3 text-sm">
                Información del Ticket
              </h2>

              <div className="grid grid-cols-2 text-xs gap-y-2">
                <p><strong>Ticket:</strong> #{ticket?.code}</p>

                <p>
                  <strong>Departamento:</strong>{" "}
                  {ticket?.department?.name ?? "N/A"}
                </p>

                <p>
                  <strong>Problema:</strong>{" "}
                  {ticket?.subject ?? "N/A"}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  {ticket?.status?.name}
                </p>

                <p>
                  <strong>Técnico:</strong>{" "}
                  {ticket?.assigned_user?.name ?? "N/A"}
                </p>

                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(ticket?.updated_at).toLocaleDateString("es-SV")}
                </p>
              </div>
            </div>

            {/* CALIFICACIÓN */}
            <div className="border rounded-md p-3 space-y-3">
              <h2 className="text-sm font-semibold">
                Calificación
              </h2>

              <StarRating
                rating={form.rating}
                onChange={form.handleRatingChange}
                error={form.errors.rating}
              />

              <ComentarioTextarea
                value={form.comentario}
                onChange={form.handleComentarioChange}
                error={form.errors.comentario}
              />
            </div>

          </div>

          {/* BOTONES */}

          <div className="flex justify-center gap-2 mt-2">
            <SubmitButton
              isFormValid={form.isFormValid}
              isSubmitting={form.isSubmitting}
              onClick={buildHandleEnviar()}
            />
            {/* <button
              onClick={onClose}
              disabled={form.isSubmitting}
              className="px-4 py-2 text-sm rounded-md w-40 border disabled:opacity-50"
            >
              Cancelar
            </button> */}
          </div>

        </div>
      </div>
    </div>
  );
}