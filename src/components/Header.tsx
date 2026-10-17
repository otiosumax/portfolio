import '../styles/Header.css'
import logo from '../assets/logo.svg'

function Header() {
  return (
    <header id="header" className="header">
      <a href="#header" className="logo" aria-label="otiosumax — наверх">
        <img src={logo} alt="" className="logo-mark" />
      </a>
      <nav className="navigation">
        <a href="#projects">Проекты</a>
        <a href="#about">Обо мне</a>
        <a href="#contact">Контакты</a>
      </nav>
    </header>
  );
}

export default Header;
