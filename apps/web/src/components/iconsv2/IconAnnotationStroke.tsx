// stroke/communication
import type { Component, JSX } from 'solid-js';

export const IconAnnotationStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.508 9.08c0-2.129 0-3.193.414-4.005a3.8 3.8 0 0 1 1.661-1.66C5.396 3 6.46 3 8.588 3h6.84c2.127 0 3.191 0 4.004.414a3.8 3.8 0 0 1 1.66 1.66c.415.813.415 1.877.415 4.006v4.56c0 .705 0 1.058-.047 1.353a3.8 3.8 0 0 1-3.159 3.16c-.57.09-1.148 0-1.72.054a1.9 1.9 0 0 0-1.232.616c-.334.37-.61.802-.91 1.2-.824 1.1-1.237 1.651-1.743 1.848a1.9 1.9 0 0 1-1.377 0c-.506-.197-.919-.747-1.744-1.848-.298-.398-.575-.83-.91-1.2a1.9 1.9 0 0 0-1.231-.616c-.571-.053-1.15.035-1.72-.055a3.8 3.8 0 0 1-3.159-3.159c-.047-.295-.047-.648-.047-1.354z" fill="none"/>
    </svg>
  );
};

export default IconAnnotationStroke;
