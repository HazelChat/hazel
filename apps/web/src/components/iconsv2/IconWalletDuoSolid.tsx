// duo-solid/web3-&-crypto
import type { Component, JSX } from 'solid-js';

export const IconWalletDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28" opacity=".28"/><path fill="currentColor" d="M14.6 6c1.545 0 2.675 0 3.56.144.404.066.777.164 1.136.313a6 6 0 0 1 3.247 3.247c.25.601.356 1.244.407 1.992.05.732.05 1.634.05 2.768v.158c0 1.23.001 2.569-.457 3.674a6 6 0 0 1-3.247 3.247c-.601.25-1.244.356-1.992.407-.731.05-1.633.05-2.768.05H9.464c-1.134 0-2.036 0-2.768-.05-.748-.05-1.39-.157-1.992-.407a6 6 0 0 1-3.247-3.247C.999 17.191 1 15.852 1 14.622v-.158c0-1.134 0-2.036.05-2.768.051-.748.158-1.39.407-1.992a6 6 0 0 1 3.247-3.247c.602-.25 1.244-.356 1.992-.407C7.428 6 8.33 6 9.464 6zm-.6 5a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2z"/>
    </svg>
  );
};

export default IconWalletDuoSolid;
