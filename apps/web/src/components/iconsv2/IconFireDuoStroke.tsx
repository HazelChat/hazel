// duo-stroke/general
import type { Component, JSX } from 'solid-js';

export const IconFireDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.6 2.125C12.663 4.512 10.003 8 8 8c0 0-.712-.905-1.306-1.985C5.2 7.925 4 10.365 4 13c0 4 2.667 8 8 8s8-4 8-8c0-5.445-5.123-10.066-7.4-10.875Z" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.405 20.15c-1.632 1.382-4.426 1.055-5.46-.817-1.647-2.985 2.858-6.044 4.464-6.847 1.617.81 3.889 5.215.996 7.665Z" fill="none"/>
    </svg>
  );
};

export default IconFireDuoStroke;
