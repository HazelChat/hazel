// duo-solid/devices
import type { Component, JSX } from 'solid-js';

export const IconPhoneDuoSolid1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M11.357 1c-1.084 0-1.958 0-2.666.058-.728.06-1.369.185-1.961.487A5 5 0 0 0 4.545 3.73c-.302.592-.428 1.233-.487 1.961C4 6.4 4 7.273 4 8.357v7.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C9.4 23 10.273 23 11.357 23h1.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C20 17.6 20 16.727 20 15.643V8.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.961a5 5 0 0 0-2.185-2.185c-.592-.302-1.232-.428-1.961-.487C14.6 1 13.727 1 12.643 1z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19h.01"/>
    </svg>
  );
};

export default IconPhoneDuoSolid1;
