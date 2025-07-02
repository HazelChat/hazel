// stroke/general
import type { Component, JSX } from 'solid-js';

export const IconGiftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11.997c-.132.003-.293.003-.5.003H12m8-.003c.164-.005.283-.014.39-.035a2 2 0 0 0 1.572-1.572C22 10.197 22 9.965 22 9.5s0-.697-.038-.89a2 2 0 0 0-1.572-1.572C20.197 7 19.965 7 19.5 7h-5m5.5 4.997V16.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 21 16.88 21 15.2 21H12m-8-9.003c.132.003.293.003.5.003H12m-8-.003a2.3 2.3 0 0 1-.39-.035 2 2 0 0 1-1.572-1.572C2 10.197 2 9.965 2 9.5s0-.697.038-.89A2 2 0 0 1 3.61 7.038C3.803 7 4.035 7 4.5 7h5M4 11.997V16.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 21 7.12 21 8.8 21H12m2.5-14A2.5 2.5 0 1 0 12 4.5M14.5 7H12m0-2.5A2.5 2.5 0 1 0 9.5 7M12 4.5V7M9.5 7H12m0 14v-9m0 0V7" fill="none"/>
    </svg>
  );
};

export default IconGiftStroke;
