// duo-solid/weather
import type { Component, JSX } from "solid-js"

export const IconWaterTripleDropletDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.673 1.316a1 1 0 0 0-1.346 0C8.09 4.263 7.069 6.96 7.655 9.123c.576 2.128 2.597 3.266 4.345 3.266s3.769-1.138 4.345-3.266c.586-2.163-.436-4.86-3.672-7.807Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M6.673 11.526a1 1 0 0 0-1.346 0c-3.236 2.947-4.258 5.644-3.672 7.807C2.23 21.46 4.252 22.599 6 22.599s3.769-1.138 4.345-3.266c.586-2.163-.436-4.86-3.672-7.807Zm12 0a1 1 0 0 0-1.346 0c-3.236 2.947-4.258 5.644-3.672 7.807.576 2.128 2.597 3.266 4.345 3.266s3.769-1.138 4.345-3.266c.586-2.163-.436-4.86-3.672-7.807Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconWaterTripleDropletDuoSolid
