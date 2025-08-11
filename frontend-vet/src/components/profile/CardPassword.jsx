import { useForm } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";

const CardPassword = () => {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const {user,updatePasswordProfile} = storeProfile()
    const { clearToken } = storeAuth()

    const updatePassword = async (data) => {
        const response = await updatePasswordProfile(data, user._id)
        if(response){
            clearToken()
        }
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={2000} />
            <div
                style={{
                    background: '#ffffff',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    width: '100%',
                    maxWidth: '750px',
                }}
            >
                <h2
                    style={{
                        fontSize: '1.6rem',
                        fontWeight: '600',
                        color: '#3B2F2F',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        fontFamily: "'Playfair Display', serif",
                    }}
                >
                    Actualizar Contraseña
                </h2>
                <hr
                    style={{
                        border: 'none',
                        borderTop: '2px solid #ccc',
                        marginBottom: '0.5rem',
                    }}
                />

                <form
                    onSubmit={handleSubmit(updatePassword)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label
                            style={{
                                fontWeight: '600',
                                color: '#3B2F2F',
                                marginBottom: '0.5rem',
                            }}
                        >
                            Contraseña actual
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña actual"
                            style={{
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                color: '#333',
                            }}
                            {...register("passwordactual", {
                                required: "La contraseña actual es obligatoria",
                            })}
                        />
                        {errors.passwordactual && (
                            <p
                                style={{
                                    color: 'red',
                                    fontSize: '0.8rem',
                                    marginTop: '0.3rem',
                                }}
                            >
                                {errors.passwordactual.message}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label
                            style={{
                                fontWeight: '600',
                                color: '#3B2F2F',
                                marginBottom: '0.5rem',
                            }}
                        >
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa la nueva contraseña"
                            style={{
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                color: '#333',
                            }}
                            {...register("passwordnuevo", {
                                required: "La nueva contraseña es obligatoria",
                            })}
                        />
                        {errors.passwordnuevo && (
                            <p
                                style={{
                                    color: 'red',
                                    fontSize: '0.8rem',
                                    marginTop: '0.3rem',
                                }}
                            >
                                {errors.passwordnuevo.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '0.5rem',
                            backgroundColor: '#AA4A44',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '1rem',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#8C3E39')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#AA4A44')}
                    >
                        Cambiar
                    </button>
                </form>
            </div>
        </>
    );
};

export default CardPassword;
