// solid/devices
import type { Component, JSX } from "solid-js"

export const IconTelescope: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.713 2.308a1 1 0 0 1 1.124.73l2.448 9.136a1 1 0 0 1-.707 1.225l-1.931.517a3 3 0 0 1-3.104-1.008l-2.573.512-.004.037a3 3 0 0 1-.808 1.623l2.737 5.473.04.093a1 1 0 0 1-1.779.89l-.05-.089-2.737-5.47a3 3 0 0 1-.74-.001l-2.734 5.471a1 1 0 0 1-1.79-.894l2.736-5.474q-.24-.25-.42-.552l-5.386 1.076a2 2 0 0 1-2.323-1.445l-.55-2.053a2 2 0 0 1 1.29-2.413l.853-.289-.173-.644a1 1 0 0 1 1.932-.518l.14.518L15.495 5.27a3 3 0 0 1 2.185-2.423l1.931-.518zm-16.62 9.279.55 2.054 5.388-1.075A3 3 0 0 1 12 10c1.093 0 2.047.587 2.571 1.461l2.194-.437-1-3.734z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTelescope
