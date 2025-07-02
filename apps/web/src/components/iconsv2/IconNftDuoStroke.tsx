// duo-stroke/web3-&-crypto
import type { Component, JSX } from 'solid-js';

export const IconNftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5.113 6.292-1.454 2.6c-.635 1.134-.952 1.702-1.076 2.302-.11.532-.11 1.08 0 1.612.124.6.441 1.168 1.076 2.302l1.454 2.6c.67 1.198 1.005 1.797 1.482 2.234.422.385.921.677 1.466.856a3.8 3.8 0 0 0 .907.167C9.417 21 9.973 21 10.746 21h2.544c1.36 0 2.04 0 2.648-.197a4 4 0 0 0 1.453-.836c.475-.426.813-1.012 1.49-2.183L19.91 16l.496-.926c.603-1.123.905-1.684 1.02-2.276A4 4 0 0 0 21.359 11c-.15-.519-.458-1.067-1.005-2.045l-1.49-2.663c-.67-1.198-1.004-1.797-1.481-2.233a4 4 0 0 0-1.466-.857C15.302 3 14.612 3 13.232 3h-2.486c-1.38 0-2.07 0-2.685.202a4 4 0 0 0-1.466.857c-.477.436-.812 1.035-1.482 2.233Z" opacity=".28"/><path fill="currentColor" d="M19.791 10h-.818c-.875 0-1.382 0-1.82.038-4.86.422-8.72 4.25-9.147 9.09-.015.17-.024.35-.03.558q.192.095.396.162c.173.057.375.096.675.12.25.02.545.027.924.03a9 9 0 0 1 .028-.695c.34-3.862 3.425-6.933 7.328-7.273.34-.03.754-.03 1.71-.03h1.462a3 3 0 0 0-.1-.72c-.089-.305-.255-.64-.608-1.28Z"/><path fill="currentColor" d="M8.897 21.962H8.89l-.011-.002z"/><path fill="currentColor" d="m22.325 10.74-.006-.02-.006-.02z"/><path fill="currentColor" fill-rule="evenodd" d="M6.96 9c0-1.111.906-2 2.008-2s2.007.889 2.007 2-.905 2-2.007 2A2.003 2.003 0 0 1 6.96 9Z" clip-rule="evenodd"/>
    </svg>
  );
};

export default IconNftDuoStroke;
