function Hero({heroText}: {heroText?: string}) {
  return (
    <section className="hero">
      <div className="hero-text">
        <p className="eyebrow">
          <span className="status-dot" /> &emsp;
          Фронтенд разработчик. Москва.
        </p>
        <h1>Делаю сайты</h1>
        <div>
          <p>{heroText}</p>
        </div>
      </div>
      <img className="hero-image" src="/portfolio/photo.jpg"/>
    </section>
  );
}
export default Hero;
