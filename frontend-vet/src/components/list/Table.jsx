import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';  // Importas useNavigate

const Table = ({ entidad }) => {

    const { fetchDataBackend } = useFetch();
    const [registros, setRegistros] = useState([]);
    const navigate = useNavigate();  // Inicializas useNavigate

    const listarRegistros = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${entidad}/todos`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        };

        const response = await fetchDataBackend(url, null, "GET", headers);

        if (response && Array.isArray(response)) {
            setRegistros(response);
        } else {
            console.error("Respuesta inválida:", response);
        }
    };

    useEffect(() => {
        listarRegistros();
    }, [entidad]);

    if (registros.length === 0) {
        return (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium">No existen registros de {entidad}</span>
            </div>
        );
    }

    return (
        <table className="w-full mt-5 table-auto shadow-lg bg-white">
            <thead className="bg-gray-800 text-slate-400">
                <tr>
                    {[
                        "N°", "Nombre", "Apellido", "Email", "Teléfono", "Estado General", "Creado", "Acciones"
                    ].map(header => (
                        <th key={header} className="p-2">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {registros.map((item, index) => (
                    <tr className="hover:bg-gray-300 text-center" key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.nombre}</td>
                        <td>{item.apellido}</td>
                        <td>{item.email}</td>
                        <td>{item.telefono || "N/A"}</td>
                        <td>{item.estado_Emprendedor || "N/A"}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className='py-2 text-center'>
                            <MdPublishedWithChanges
                                title="Actualizar"
                                className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-blue-600"
                            />
                            <MdInfo
                                title="Más información"
                                className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-600"
                                onClick={() => navigate(`/dashboard/visualizar/${item._id}`)}  // Navegación al detalle
                            />
                            <MdDeleteForever
                                title="Eliminar"
                                className="h-7 w-7 text-red-900 cursor-pointer inline-block hover:text-red-600"
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
