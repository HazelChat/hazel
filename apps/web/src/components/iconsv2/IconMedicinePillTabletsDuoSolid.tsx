// duo-solid/medical
import type { Component, JSX } from "solid-js"

export const IconMedicinePillTabletsDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M12.866 5.735a6 6 0 1 0-11.73 2.532 6 6 0 0 0 11.73-2.532Z" />
				<path fill="currentColor" d="M19.064 11.367a6 6 0 1 0-4.125 11.269 6 6 0 0 0 4.125-11.27Z" />
			</g>
			<path
				fill="currentColor"
				d="M12.1 6.923a1 1 0 0 0-.422-1.954l-9.775 2.11a1 1 0 1 0 .422 1.955z"
			/>
			<path
				fill="currentColor"
				d="M12.65 14.344a1 1 0 0 0-.687 1.878l9.39 3.437a1 1 0 0 0 .688-1.878z"
			/>
		</svg>
	)
}

export default IconMedicinePillTabletsDuoSolid
