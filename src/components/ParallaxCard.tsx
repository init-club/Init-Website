import React, { useRef } from "react";

interface Props {
  title: string;
  desc: string;
}

const ParallaxCard: React.FC<Props> = ({ title, desc }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateY = ((x - midX) / midX) * 12;
    const rotateX = -((y - midY) / midY) * 12;

    // Direct GPU transform (NO re-render)
    cardRef.current.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    cardRef.current.style.transition = "transform 0.5s ease";
    cardRef.current.style.transform = `
      rotateX(0deg)
      rotateY(0deg)
    `;

    setTimeout(() => {
      if (!cardRef.current) return;
      cardRef.current.style.transition = "";
    }, 500);
  };

  return (
    <div
      style={{ perspective: "900px" }}
      className="parallax-wrapper"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass rounded-xl p-8 border border-white/10 cursor-pointer hover:border-cyan-400 will-change-transform"
      >
        <h3 className="text-xl font-semibold mb-3 text-white">
          {title}
        </h3>

        <p className="text-white/80">{desc}</p>
      </div>
    </div>
  );
};

export default ParallaxCard;
