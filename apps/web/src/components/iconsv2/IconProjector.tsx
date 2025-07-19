// solid/appliances
import type { Component, JSX } from "solid-js"

export const IconProjector: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 8c.835-.627 1.875-1 3-1s2.165.373 3 1h4.032c.439 0 .817 0 1.13.021.33.023.66.072.986.207a3 3 0 0 1 1.624 1.624c.135.326.184.656.207.986.021.313.021.691.021 1.13v.064c0 .439 0 .817-.021 1.13-.023.33-.072.66-.207.986a3 3 0 0 1-1.624 1.624 3.1 3.1 0 0 1-.986.207l-.162.009V16a1 1 0 1 1-2 0h-3c-.835.627-1.875 1-3 1a5 5 0 0 1-3-1H6a1 1 0 1 1-2 0v-.012l-.162-.01a3.1 3.1 0 0 1-.986-.206 3 3 0 0 1-1.624-1.624 3 3 0 0 1-.207-.986A18 18 0 0 1 1 12.032v-.064c0-.439 0-.817.021-1.13.023-.33.072-.66.207-.986a3 3 0 0 1 1.624-1.624 3 3 0 0 1 .986-.207C4.15 8 4.529 8 4.968 8zm3 1c-.761 0-1.455.282-1.984.75A3 3 0 0 0 9 12c0 .896.391 1.7 1.016 2.25.53.468 1.223.75 1.984.75s1.455-.282 1.984-.75A3 3 0 0 0 15 12c0-.896-.391-1.7-1.016-2.25A3 3 0 0 0 12 9Zm7 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconProjector
