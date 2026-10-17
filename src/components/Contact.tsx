export default function Contact({
  email,
  links = [],
}: {
  email?: string;
  links?: { name: string; link?: string }[];
}) {
  return (
    <section className="contact" id="contact">
      <p>Ищите фронтенд-разработчика?</p>
      <h2>А я как раз подхожу!</h2>
      <a className="mail" type="email" href={`mailto:${email}`}>
        {email}
      </a>
      <div style={{ height: "8rem" }} />
      <footer>
        <span>&copy; 2207 Богданов М.</span>
        <div className="socials">
          {links.map((link, index) => (
            <a key={index} href={link.link}>
              {link.name}
            </a>
          ))}
        </div>
        <div />
      </footer>
    </section>
  );
}
