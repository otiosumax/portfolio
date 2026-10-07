import "./Homepage.css";

function Header() {
  return (
    <div className="header">
      <img
        src="/src/assets/vite.svg"
        alt="Logo"
        className="logo"
        grid-area="a"
      />
      <nav className="navigation" grid-area="b">
        <a href="#work">Работы</a>
        <a href="#about">Обо мне</a>
        <a href="#contact">Контакты</a>
      </nav>
    </div>
  );
}

export default Header;
