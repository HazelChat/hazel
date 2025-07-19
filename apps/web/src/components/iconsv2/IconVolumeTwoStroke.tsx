// stroke/media
import type { Component, JSX } from "solid-js"

export const IconVolumeTwoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17 14a2.9 2.9 0 0 0 .74-.917c.172-.344.26-.711.26-1.083 0-.371-.088-.74-.26-1.082A2.9 2.9 0 0 0 17 10m1 9c.786-.38 1.5-.939 2.102-1.642a7.8 7.8 0 0 0 1.405-2.458c.325-.92.493-1.905.493-2.9s-.168-1.98-.493-2.9a7.8 7.8 0 0 0-1.405-2.457A6.5 6.5 0 0 0 18 5m-4 .088v13.825c0 1.71-1.934 2.706-3.326 1.711L7.86 18.615a4.9 4.9 0 0 0-1.898-.822A4.93 4.93 0 0 1 2 12.959v-1.918a4.93 4.93 0 0 1 3.963-4.833 4.9 4.9 0 0 0 1.898-.823l2.813-2.009c1.392-.994 3.326 0 3.326 1.712Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVolumeTwoStroke
