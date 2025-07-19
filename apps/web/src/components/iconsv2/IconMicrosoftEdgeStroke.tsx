// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconMicrosoftEdgeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13.348 21.547c-3.293-.036-5.71-3.404-5.71-6.013 0-2.332 1.37-4.36 2.805-5.327m0 0c.572-.385 1.154-.602 1.663-.602 1.992 0 2.43 2.14 2.43 2.14m-4.093-1.538c-.29.267-.727.855-.727 1.99 0 4.924 6.938 7.342 10.414 4.872.469-.411.991.035.697.482-1.823 2.792-5.147 4.072-8.721 4.072a9.622 9.622 0 1 1 7.52-15.65c2.956 3.68 2.757 9.257-3.08 9.257-1.5 0-2.84-.451-2.84-1.117 0-.858.857-.665.857-2.095 0-2.949-3.172-5.084-5.866-5.084S2.501 8.76 2.501 12.018m7.942-1.811a1.2 1.2 0 0 1 .255-.186"
				fill="none"
			/>
		</svg>
	)
}

export default IconMicrosoftEdgeStroke
