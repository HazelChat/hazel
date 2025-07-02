// solid/time
import type { Component, JSX } from 'solid-js';

export const IconCalendar: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M8 1a1 1 0 0 1 1 1v1.04C9.805 3 10.759 3 11.916 3h.168c1.157 0 2.111 0 2.916.04V2a1 1 0 1 1 2 0v1.305q.35.092.679.228a7 7 0 0 1 3.788 3.788c.214.517.339 1.064.414 1.679H2.12c.074-.615.199-1.162.413-1.679A7 7 0 0 1 6.32 3.533 5 5 0 0 1 7 3.305V2a1 1 0 0 1 1-1Z" fill="currentColor"/><path d="M2.01 11C2 11.581 2 12.235 2 12.974v.063c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.947.059-3.314v-.063c0-.74 0-1.393-.01-1.974z" fill="currentColor"/>
    </svg>
  );
};

export default IconCalendar;
