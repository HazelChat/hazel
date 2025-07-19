// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconPeopleFemaleDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1.034a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M11.998 9a4.74 4.74 0 0 0-4.624 3.71l-1.35 6.073A1 1 0 0 0 7 20h1.475l.488 1.057a3.345 3.345 0 0 0 6.074 0L15.525 20h1.46a1 1 0 0 0 .977-1.215l-1.34-6.069A4.74 4.74 0 0 0 11.999 9Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconPeopleFemaleDuoSolid
