// duo-stroke/general
import type { Component, JSX } from 'solid-js';

export const IconSpreadsheetDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15V9h-6m6 6c-.002 1.977-.027 3.013-.436 3.816a4 4 0 0 1-1.748 1.748c-.803.41-1.84.434-3.816.436m6-6h-6m0 0V9m0 6H9m6 0v6m0-12H9m0 0v6m0-6H3v6m6 0v6m0-6H3m6 6h6m-6 0c-1.977-.002-3.013-.027-3.816-.436a4 4 0 0 1-1.748-1.748c-.41-.803-.434-1.84-.436-3.816" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3.026 5.987 3.002 7.024 3 9h18c-.002-1.977-.027-3.013-.436-3.816a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3Z" fill="none"/>
    </svg>
  );
};

export default IconSpreadsheetDuoStroke;
