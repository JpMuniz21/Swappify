import { requisitar } from './authService';

// Perfil de outra pessoa (só leitura): sem e-mail, bairro ou CEP.
export const buscarPerfilPublico = async (id) => (await requisitar(`/usuarios/${id}`))?.data ?? null;
