// contrast/general
import type { Component, JSX } from 'solid-js';

export const IconFire1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" fill-rule="evenodd" d="M12.6 2.125C12.663 4.512 10.003 8 8 8c0 0-.712-.905-1.306-1.985C5.2 7.925 4 10.365 4 13c0 4 2.667 8 8 8s8-4 8-8c0-5.445-5.123-10.066-7.4-10.875Z" clip-rule="evenodd" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21c-5.333 0-8-4-8-8 0-2.634 1.199-5.075 2.694-6.985A16.4 16.4 0 0 0 8 8c2.003 0 4.663-3.488 4.6-5.875C14.877 2.935 20 7.555 20 13c0 4-2.667 8-8 8Zm0 0c.863-.001 1.733-.28 2.405-.85 2.893-2.448.621-6.854-.996-7.663-1.606.803-6.111 3.861-4.463 6.847C9.553 20.434 10.769 21 12 21Z"/>
    </svg>
  );
};

export default IconFire1;
