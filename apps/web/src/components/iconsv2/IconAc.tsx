// solid/appliances
import type { Component, JSX } from 'solid-js';

export const IconAc: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M1 10a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm15 1a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2z" fill="currentColor"/>
    </svg>
  );
};

export default IconAc;
