export default function Marquee({ marqueeItems }: { marqueeItems: string[] }) {
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
