// duo-solid/time
import type { Component, JSX } from 'solid-js';

export const IconCalendarDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M11.916 3c-1.755 0-3.042 0-4.05.137a6 6 0 0 0-1.545.396A7 7 0 0 0 2.533 7.32c-.318.768-.439 1.605-.491 2.628C2 10.762 2 11.75 2 12.974v.063c0 1.366 0 2.443.06 3.314.06.888.186 1.634.473 2.328a7 7 0 0 0 3.788 3.788c.694.287 1.44.413 2.328.474.87.059 1.948.059 3.314.059h.074c1.366 0 2.443 0 3.314-.06.888-.06 1.634-.186 2.328-.473a7 7 0 0 0 3.788-3.788c.287-.694.413-1.44.474-2.328.059-.87.059-1.947.059-3.314v-.063c0-1.223 0-2.212-.042-3.025-.052-1.023-.173-1.86-.49-2.628a7 7 0 0 0-3.79-3.788 6 6 0 0 0-1.544-.396C15.127 3 13.84 3 12.084 3z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.96 10H3.04M8 2v4m8-4v4"/>
    </svg>
  );
};

export default IconCalendarDuoSolid;
