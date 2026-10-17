export default function Marquee() {
  const marqueeItems = [
    "строка 1",
    "строка 2",
    "строка 3",
    "строка 4",
    "строка 5",
    "строка 6",
    "строка 7",
  ];

  return (
    <div className="marquee">
      <div className="marquee-track">
        <div className="marquee-group">
          {marqueeItems.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>

        <div className="marquee-group" aria-hidden="true">
          {marqueeItems.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
