// duo-stroke/media
import type { Component, JSX } from 'solid-js';

export const IconPointerCursorDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.823 10.172c-.698-2.793-1.047-4.189-.666-5.162A3.27 3.27 0 0 1 5.01 3.157c.973-.381 2.37-.032 5.162.666l5.344 1.336c2.382.595 3.573.893 4.056 1.223a3.272 3.272 0 0 1 .196 5.261c-.458.365-1.623.75-3.954 1.52-.419.14-.628.208-.817.3a3.27 3.27 0 0 0-1.535 1.534c-.09.189-.16.398-.298.817-.771 2.33-1.156 3.497-1.52 3.954a3.272 3.272 0 0 1-5.262-.196c-.33-.483-.628-1.674-1.223-4.056z" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.172 3.823c-2.793-.698-4.189-1.047-5.162-.666A3.27 3.27 0 0 0 3.157 5.01c-.381.973-.032 2.37.666 5.162" fill="none"/>
    </svg>
  );
};

export default IconPointerCursorDuoStroke;
