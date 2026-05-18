import Image from "next/image";

interface AvatarProps {
  src?: string;
  name: string;
  isAI?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "w-6 h-6 text-label-sm", md: "w-8 h-8 text-label-md", lg: "w-10 h-10 text-body-md" };

export function Avatar({ src, name, isAI = false, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={40}
        height={40}
        className={`${sizeMap[size]} rounded-full object-cover ${isAI ? "ring-2 ring-secondary" : "ring-1 ring-outline-variant"} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-on-primary ${isAI ? "bg-secondary ring-2 ring-secondary/30" : "bg-primary"} ${className}`}
      title={name}
      aria-label={name}
    >
      {isAI ? (
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
        </svg>
      ) : (
        initials
      )}
    </div>
  );
}
