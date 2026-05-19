import { Navigate, useParams } from 'react-router-dom';

/** QR tipo 1: entrada → misma experiencia que menú por token de cafetería */
export default function QrEntrada() {
  const { token } = useParams();
  return <Navigate to={`/cafeteria/${token}`} replace />;
}
