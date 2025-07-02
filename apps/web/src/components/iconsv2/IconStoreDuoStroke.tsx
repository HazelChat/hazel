// duo-stroke/building
import type { Component, JSX } from 'solid-js';

export const IconStoreDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13.749v4.857c0 .84 0 1.26-.163 1.58a1.5 1.5 0 0 1-.656.656c-.32.164-.74.164-1.581.164H6.4c-.84 0-1.26 0-1.581-.164a1.5 1.5 0 0 1-.656-.655C4 19.866 4 19.446 4 18.606v-4.86" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.432 7.328c.117 1.172.338 2.343.338 3.523a3.256 3.256 0 1 1-6.512 0 3.256 3.256 0 1 1-6.512 0 3.256 3.256 0 1 1-6.512 0c0-1.18.217-2.351.334-3.523.124-1.243.135-2.629 1.117-3.531.997-.917 2.392-.791 3.659-.791h9.312c1.268 0 2.662-.126 3.66.791.98.902.992 2.288 1.116 3.531Z" fill="none"/>
    </svg>
  );
};

export default IconStoreDuoStroke;
