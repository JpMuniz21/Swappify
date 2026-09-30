import './AuthLayout.css';
import logo from '../../assets/logo-swappify.svg';
import fotoManicure from '../../assets/foto-titulo-3.svg';
import fotoFotografa from '../../assets/foto-titulo-1.svg';
import fotoPadeiro from '../../assets/foto-titulo-2.svg';
import adesivoX from '../../assets/adesivo-x.svg';
import adesivoEstrela from '../../assets/adesivo-estrela.svg';
import adesivoBalao from '../../assets/adesivo-balao.svg';
import adesivoCoracao from '../../assets/adesivo-coracao.svg';
import adesivoSeta from '../../assets/adesivo-seta.svg';

export default function AuthLayout({ children }) {
  return (
    <main className="auth">
      <section className="auth-painel">
        <p className="auth-slogan">
          Conectamos pessoas, talentos e oportunidades em uma plataforma onde
          serviços são trocados
        </p>
        <div className="auth-colagem" aria-hidden="true">
          <img className="colagem-foto colagem-esquerda" src={fotoManicure} alt="" />
          <img className="colagem-foto colagem-centro" src={fotoFotografa} alt="" />
          <img className="colagem-foto colagem-direita" src={fotoPadeiro} alt="" />

          <img className="adesivo adesivo-x" src={adesivoX} alt="" />
          <img className="adesivo adesivo-estrela-a" src={adesivoEstrela} alt="" />
          <img className="adesivo adesivo-estrela-b" src={adesivoEstrela} alt="" />
          <img className="adesivo adesivo-estrela-c" src={adesivoEstrela} alt="" />
          <img className="adesivo adesivo-balao" src={adesivoBalao} alt="" />
          <img className="adesivo adesivo-coracao" src={adesivoCoracao} alt="" />
          <img className="adesivo adesivo-seta" src={adesivoSeta} alt="" />
        </div>
        <p className="auth-slogan-final">
          de forma <span>simples e rápida.</span>
        </p>
      </section>

      <section className="auth-form">
        <div className="auth-marca">
          <img className="auth-logo" src={logo} alt="" />
          <span className="auth-nome">Swappify</span>
        </div>
        {children}
      </section>
    </main>
  );
}
