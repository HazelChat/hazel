// duo-stroke/web3-&-crypto
import type { Component, JSX } from 'solid-js';

export const IconWalletDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 12h3M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h5c2.33 0 3.495 0 4.413-.38a5 5 0 0 0 2.706-2.707C22 16.995 22 15.83 22 14.5c0-2.33 0-3.495-.38-4.413a5 5 0 0 0-2.707-2.706A4 4 0 0 0 18 7.13C17.195 7 16.134 7 14.5 7h-5c-2.33 0-3.495 0-4.413.38a5 5 0 0 0-2.706 2.707C2 11.005 2 12.17 2 14.5Z" fill="none"/>
    </svg>
  );
};

export default IconWalletDuoStroke;
