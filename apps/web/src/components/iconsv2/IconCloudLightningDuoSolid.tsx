// duo-solid/weather
import type { Component, JSX } from "solid-js"

export const IconCloudLightningDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.465 6.715a7.502 7.502 0 0 0-14.348 1.46A5.502 5.502 0 0 0 6.5 19h2.805a3.5 3.5 0 0 1-1.97-1.642 3.38 3.38 0 0 1 .203-3.572l3.041-4.473a3 3 0 0 1 4.962 3.374l-.795 1.168.198.032c.978.159 1.975.734 2.548 1.768a3.38 3.38 0 0 1 .01 3.268 6.502 6.502 0 0 0 1.963-12.208Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M13.622 10.173a1 1 0 0 1 .265 1.39l-2.56 3.764 3.297.534c.453.074.88.334 1.12.764a1.38 1.38 0 0 1-.113 1.518l-3.478 4.47a1 1 0 1 1-1.578-1.227l2.87-3.69-3.231-.524A1.55 1.55 0 0 1 9.09 16.4a1.38 1.38 0 0 1 .091-1.474l3.052-4.488a1 1 0 0 1 1.39-.265Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconCloudLightningDuoSolid
