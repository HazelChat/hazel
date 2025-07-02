// duo-solid/general
import type { Component, JSX } from 'solid-js';

export const IconSpreadsheetDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g opacity=".28"><path fill="currentColor" d="M2 10.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/><path fill="currentColor" d="M2.07 17.443A.41.41 0 0 1 2.48 17H7.5a.5.5 0 0 1 .5.5v3.988a.494.494 0 0 1-.506.496 15 15 0 0 1-.937-.054c-.673-.064-1.27-.192-1.827-.475a5 5 0 0 1-2.185-2.185c-.283-.556-.411-1.154-.475-1.827Z"/><path fill="currentColor" d="M10.5 22a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5z"/><path fill="currentColor" d="M16.507 21.984a.494.494 0 0 1-.507-.496V17.5a.5.5 0 0 1 .5-.5h5.02c.24 0 .433.203.41.443-.064.673-.192 1.27-.475 1.827a5 5 0 0 1-2.185 2.185c-.556.284-1.154.411-1.827.475q-.427.04-.936.054Z"/><path fill="currentColor" d="M22 14.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5z"/><path fill="currentColor" d="M10 14.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5z"/></g><path fill="currentColor" fill-rule="evenodd" d="M9.357 2h5.286c1.083 0 1.958 0 2.665.058.73.06 1.37.185 1.962.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961q.03.37.042.802a.494.494 0 0 1-.496.507H2.512a.494.494 0 0 1-.496-.507q.012-.432.042-.802c.06-.728.185-1.369.487-1.96A5 5 0 0 1 4.73 2.544c.592-.302 1.232-.428 1.961-.487C7.4 2 8.273 2 9.357 2Z" clip-rule="evenodd"/>
    </svg>
  );
};

export default IconSpreadsheetDuoSolid;
