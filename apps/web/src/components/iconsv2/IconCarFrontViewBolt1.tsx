// contrast/automotive
import type { Component, JSX } from "solid-js"

export const IconCarFrontViewBolt1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.735 5h-7.47c-.92 0-1.38 0-1.8.125a3 3 0 0 0-1.02.534c-.34.274-.603.652-1.127 1.409L2.853 9.184c-.317.458-.475.687-.588.936a3 3 0 0 0-.216.692C2 11.08 2 11.359 2 11.916V19a2 2 0 1 0 4 0v-1.002c4 .028 8 .002 12 .002v1a2 2 0 1 0 4 0v-7.084c0-.557 0-.835-.05-1.104a3 3 0 0 0-.215-.692c-.113-.25-.271-.478-.588-.936l-1.465-2.116c-.524-.757-.786-1.135-1.128-1.409a3 3 0 0 0-1.02-.534C17.117 5 16.656 5 15.736 5Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.828 10.352q.08.225.123.46c.049.269.049.547.049 1.104V19a2 2 0 1 1-4 0v-1c-4 0-8 .026-12-.002V19a2 2 0 1 1-4 0v-7.084c0-.557 0-.835.05-1.104q.043-.235.122-.46m19.656 0a3 3 0 0 0-.093-.232c-.113-.25-.271-.478-.588-.936l-1.465-2.116c-.524-.757-.786-1.135-1.128-1.409a3 3 0 0 0-1.02-.534C17.117 5 16.656 5 15.736 5h-7.47c-.92 0-1.38 0-1.8.125a3 3 0 0 0-1.02.534c-.34.274-.603.652-1.127 1.409L2.853 9.184c-.317.458-.475.687-.588.936a3 3 0 0 0-.093.232m19.656 0q.603-.088 1.172-.186m-20.828.186Q1.57 10.264 1 10.166M12 8l-2.154 3.5h4.307L12 15"
			/>
		</svg>
	)
}

export default IconCarFrontViewBolt1
