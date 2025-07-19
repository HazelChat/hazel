// duo-solid/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconLinkedinDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				d="M9.357 2.5h5.286c.818 0 1.501 0 2.08.023l.545.034c.61.05 1.12.145 1.58.342l.195.091a4.5 4.5 0 0 1 1.793 1.657l.174.31c.227.446.346.936.41 1.52l.024.255c.056.683.056 1.534.056 2.625v5.286c0 .818 0 1.501-.023 2.08l-.033.545c-.05.61-.146 1.12-.343 1.58l-.091.195a4.5 4.5 0 0 1-1.658 1.793l-.309.174c-.446.227-.936.346-1.52.41l-.255.024c-.683.056-1.534.056-2.625.056H9.357c-.818 0-1.501 0-2.08-.023l-.545-.033c-.61-.05-1.12-.146-1.58-.343l-.195-.091a4.5 4.5 0 0 1-1.793-1.658l-.174-.309c-.227-.446-.346-.936-.41-1.52l-.023-.255c-.056-.683-.057-1.534-.057-2.625V9.357l.007-1.465q.005-.326.016-.615l.034-.545c.05-.61.145-1.12.342-1.58l.091-.195a4.5 4.5 0 0 1 1.657-1.793l.31-.174c.446-.227.936-.346 1.52-.41l.255-.023c.342-.028.725-.043 1.16-.05z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M17 17v-3.5a2.5 2.5 0 0 0-5 0m0 0V17zm0 0v-3zm-4-3V17zM8 7v.01z" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 17v-3.5a2.5 2.5 0 0 0-5 0m0 0V17m0-3.5v-3m-4 0V17M8 7v.01"
			/>
		</svg>
	)
}

export default IconLinkedinDuoSolid
