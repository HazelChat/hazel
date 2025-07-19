// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconLayersToStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.903 4.775 7.867 6.169c-1.31.26-2.26 1.423-2.269 2.78l-.048 7.286m9.353-11.46.206-.041c1.74-.345 3.355 1.016 3.343 2.819l-.002.212m-3.547-2.99.001-.215c.012-1.802-1.603-3.164-3.343-2.819L4.319 3.177c-1.31.26-2.26 1.423-2.269 2.78l-.05 7.5c-.012 1.802 1.603 3.163 3.343 2.819l.207-.041m0 0-.002.214c-.012 1.802 1.603 3.163 3.343 2.82l.206-.042m0 0-.001.213c-.011 1.802 1.603 3.164 3.343 2.819l7.242-1.436c1.31-.26 2.26-1.422 2.269-2.78l.05-7.5c.012-1.802-1.603-3.164-3.343-2.819l-.207.041M9.097 19.227l.05-7.287c.008-1.357.957-2.52 2.268-2.78l7.035-1.395"
				fill="none"
			/>
		</svg>
	)
}

export default IconLayersToStroke
