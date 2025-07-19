// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserUser03: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z" fill="currentColor" />
			<path
				d="M10.112 13.916c-3.45-.956-6.862 1.638-6.862 5.218a2.616 2.616 0 0 0 2.616 2.616h12.268a2.616 2.616 0 0 0 2.616-2.616c0-3.58-3.412-6.174-6.861-5.218l-.696.193a4.47 4.47 0 0 1-2.386 0z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserUser03
