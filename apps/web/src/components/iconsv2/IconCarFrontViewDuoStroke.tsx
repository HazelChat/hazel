// duo-stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconCarFrontViewDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21.655 10.352a3 3 0 0 0-.093-.232c-.112-.25-.27-.478-.588-.936L19.51 7.068c-.524-.757-.786-1.135-1.127-1.409a3 3 0 0 0-1.02-.534C16.944 5 16.484 5 15.563 5h-7.47c-.92 0-1.38 0-1.8.125a3 3 0 0 0-1.019.534c-.341.274-.603.652-1.127 1.409L2.681 9.184c-.317.458-.475.687-.588.936a3 3 0 0 0-.093.232"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.828 10.352c-2.826.41-6.202.648-9.828.648s-7.002-.238-9.828-.648m19.656 0q.08.225.123.46c.049.269.049.547.049 1.104V19a2 2 0 1 1-4 0v-1c-4 0-8 .026-12-.002V19a2 2 0 1 1-4 0v-7.084c0-.557 0-.835.05-1.104q.043-.235.122-.46m19.656 0q.603-.088 1.172-.186m-20.828.186A45 45 0 0 1 1 10.166m17 3.606q-.494.039-1 .072m-10 0a71 71 0 0 1-1-.072"
				fill="none"
			/>
		</svg>
	)
}

export default IconCarFrontViewDuoStroke
