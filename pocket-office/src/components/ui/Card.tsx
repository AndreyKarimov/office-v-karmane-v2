import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`card ${hover ? "hover:shadow-elevated transition-shadow cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
