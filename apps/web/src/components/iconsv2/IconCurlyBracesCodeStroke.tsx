// stroke/development
import type { Component, JSX } from 'solid-js';

export const IconCurlyBracesCodeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4C6.343 4 5 5.194 5 6.667v2.666C5 10.806 3.657 12 2 12c1.657 0 3 1.194 3 2.667v2.666C5 18.806 6.343 20 8 20m8-16c1.657 0 3 1.194 3 2.667v2.666C19 10.806 20.343 12 22 12c-1.657 0-3 1.194-3 2.667v2.666C19 18.806 17.657 20 16 20" fill="none"/>
    </svg>
  );
};

export default IconCurlyBracesCodeStroke;
