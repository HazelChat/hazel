// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconServerRefreshDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					fill-rule="evenodd"
					d="M5.4 3A3.4 3.4 0 0 0 2 6.4v1.2A3.4 3.4 0 0 0 5.4 11h13.2A3.4 3.4 0 0 0 22 7.6V6.4A3.4 3.4 0 0 0 18.6 3zM13 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
					clip-rule="evenodd"
				/>
				<path
					fill="currentColor"
					d="M5.4 13A3.4 3.4 0 0 0 2 16.4v1.2A3.4 3.4 0 0 0 5.4 21h3.786a13 13 0 0 1 .755-2.82 3.47 3.47 0 0 1 1.805-1.897 3 3 0 0 1 .992-3.094q.118-.098.24-.189z"
				/>
			</g>
			<path fill="currentColor" d="M14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
			<path fill="currentColor" d="M18 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
			<path
				fill="currentColor"
				d="M16.283 15.735a3 3 0 0 1 3.214.948 9 9 0 0 1-.308-.137 1 1 0 1 0-.848 1.811c.82.384 1.683.664 2.57.836a1.47 1.47 0 0 0 1.633-.87c.352-.833.6-1.706.74-2.6a1 1 0 0 0-1.977-.306q-.022.139-.048.278a5 5 0 0 0-7.25-.962 1 1 0 0 0 1.27 1.545 3 3 0 0 1 1.004-.543Z"
			/>
			<path
				fill="currentColor"
				d="M13.413 17.997a1.47 1.47 0 0 0-1.61.913c-.33.841-.556 1.72-.67 2.618a1 1 0 1 0 1.983.255l.033-.234a5 5 0 0 0 7.225.9 1 1 0 0 0-1.275-1.54 3 3 0 0 1-4.28-.467q.195.073.385.157a1 1 0 1 0 .8-1.834c-.83-.361-1.7-.62-2.592-.768Z"
			/>
		</svg>
	)
}

export default IconServerRefreshDuoSolid
