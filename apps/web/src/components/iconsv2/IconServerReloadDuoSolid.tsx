// duo-solid/development
import type { Component, JSX } from "solid-js"

export const IconServerReloadDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M2 6.4A3.4 3.4 0 0 1 5.4 3h13.2A3.4 3.4 0 0 1 22 6.4v1.2a3.4 3.4 0 0 1-2.67 3.321 7 7 0 0 0-2.12-.326c-.826 0-1.618.143-2.353.405H5.4A3.4 3.4 0 0 1 2 7.6z"
				/>
				<path
					fill="currentColor"
					d="M11.929 13H5.4A3.4 3.4 0 0 0 2 16.4v1.2A3.4 3.4 0 0 0 5.4 21h5.69a7 7 0 0 1-.881-3.404c0-1.759.649-3.366 1.72-4.596Z"
				/>
			</g>
			<path fill="currentColor" d="M14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
			<path fill="currentColor" d="M18 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
			<path
				fill="currentColor"
				d="M14.209 17.596a3.001 3.001 0 0 1 5.327-1.897 9 9 0 0 1-.347-.154 1 1 0 1 0-.847 1.812c.82.383 1.682.664 2.57.836q.142.027.286.027a1.47 1.47 0 0 0 1.347-.898c.352-.832.6-1.705.739-2.599a1 1 0 0 0-1.977-.307l-.042.252a5.001 5.001 0 1 0-1.816 7.401 1 1 0 0 0-.897-1.788 3 3 0 0 1-4.343-2.685Z"
			/>
		</svg>
	)
}

export default IconServerReloadDuoSolid
