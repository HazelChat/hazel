// solid/development
import type { Component, JSX } from "solid-js"

export const IconServerRefresh: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				fill-rule="evenodd"
				d="M2 6.4A3.4 3.4 0 0 1 5.4 3h13.2A3.4 3.4 0 0 1 22 6.4v1.2a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 7.6zM14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M2 16.4A3.4 3.4 0 0 1 5.4 13h7.578a7 7 0 0 0-.24.189 3 3 0 0 0-.992 3.094 3.47 3.47 0 0 0-1.805 1.897A13 13 0 0 0 9.186 21H5.4A3.4 3.4 0 0 1 2 17.6z"
				fill="currentColor"
			/>
			<path
				d="M16.283 15.735a3 3 0 0 1 3.214.948 9 9 0 0 1-.308-.137 1 1 0 1 0-.848 1.811c.82.384 1.683.664 2.57.836a1.47 1.47 0 0 0 1.633-.87c.352-.833.6-1.706.739-2.6a1 1 0 0 0-1.976-.306q-.022.139-.048.278a5 5 0 0 0-7.25-.962 1 1 0 0 0 1.27 1.545 3 3 0 0 1 1.004-.543Z"
				fill="currentColor"
			/>
			<path
				d="M13.412 17.997a1.47 1.47 0 0 0-1.61.913c-.33.841-.555 1.72-.67 2.618a1 1 0 1 0 1.984.255q.014-.117.033-.234a5 5 0 0 0 7.225.9 1 1 0 0 0-1.276-1.54 3 3 0 0 1-4.28-.467q.195.073.385.157a1 1 0 0 0 .8-1.834c-.829-.361-1.7-.62-2.59-.768Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconServerRefresh
