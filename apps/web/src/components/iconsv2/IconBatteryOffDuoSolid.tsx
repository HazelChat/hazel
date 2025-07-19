// duo-solid/devices
import type { Component, JSX } from "solid-js"

export const IconBatteryOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path
					fill="currentColor"
					d="M14.036 5c.901 0 1.629 0 2.22.04.61.042 1.148.13 1.657.34q.073.03.144.063a1 1 0 0 1 .296 1.618l-11.62 11.62a1 1 0 0 1-.757.292c-.707-.035-1.318-.117-1.89-.354a5 5 0 0 1-2.705-2.706c-.212-.51-.3-1.048-.34-1.656C.988 13.507 1 12.752 1 12s-.01-1.506.04-2.257c.042-.608.13-1.147.34-1.656A5 5 0 0 1 4.088 5.38c.51-.212 1.048-.3 1.656-.34C6.493 4.988 7.248 5 8 5z"
				/>
				<path
					fill="currentColor"
					d="M20.298 8.754a1 1 0 0 1 .39.26q.161.011.312.038c.918.17 1.675.907 1.915 1.801.094.35.085.746.085 1.147 0 .4.009.797-.085 1.147-.24.894-.997 1.632-1.915 1.8l-.119.02a4.3 4.3 0 0 1-.262.946 5 5 0 0 1-2.706 2.706c-.51.212-1.048.3-1.656.34-.592.041-1.32.041-2.222.041h-2.39a1 1 0 0 1-.707-1.707l8.308-8.308a1 1 0 0 1 1.052-.231Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 3 3 21"
			/>
		</svg>
	)
}

export default IconBatteryOffDuoSolid
