// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconUserCircleDottedDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				fill-rule="evenodd"
				d="M12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-3.5 9c-2.358 0-4.358 1.767-4.493 4.089a1 1 0 0 0 .299.772A10.97 10.97 0 0 0 12 23c2.995 0 5.712-1.198 7.694-3.139a1 1 0 0 0 .299-.772C19.858 16.767 17.858 15 15.5 15z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M11 2a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Zm3.826.761a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1Zm-6.656-1a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2zm9.894 3.163a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1Zm-13.135-1a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2zm15.296 4.23a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1Zm-17.468-1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zM21 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H22a1 1 0 0 1-1-1ZM2 11a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm18.22 4.872a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1Zm-17.453-1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"
				clip-rule="evenodd"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconUserCircleDottedDuoSolid
