import type { ComponentProps } from "react";

function Icon({ children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props: ComponentProps<"svg">) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </Icon>
  );
}

export function CloseIcon(props: ComponentProps<"svg">) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function SearchIcon(props: ComponentProps<"svg">) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Icon>
  );
}

export function BagIcon(props: ComponentProps<"svg">) {
  return (
    <Icon {...props}>
      <path d="M5.5 8h13l-1 12h-11l-1-12z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </Icon>
  );
}
