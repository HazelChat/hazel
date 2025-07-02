// stroke/general
import type { Component, JSX } from 'solid-js';

export const IconEaselStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 6.04 2 7.16 2 9.4v2.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748c.803.41 1.84.434 3.816.436m4-15h3.6c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C22 6.04 22 7.16 22 9.4v2.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748c-.799.407-1.829.434-3.785.436M12 3V2M6 22l2-4m10 4-1.97-4M12 21v-2.998M16.03 18l-4.03.002M8 18l4 .002" fill="none"/>
    </svg>
  );
};

export default IconEaselStroke;
