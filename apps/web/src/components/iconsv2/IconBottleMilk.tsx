// solid/food
import type { Component, JSX } from "solid-js"

export const IconBottleMilk: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 1a1 1 0 1 1 0 2v1.788l.008.222a3 3 0 0 0 .496 1.443l.656.984.194.315A5 5 0 0 1 18 10.21V20c0 .593-.175 1.145-.473 1.61l-.034.057c-.219.326-.5.607-.826.826q-.028.018-.057.034a3 3 0 0 1-.196.117l-.023.011c-.333.175-.7.29-1.091.33h-.012Q15.146 23 15 23H9l-.154-.004-.135-.01-.012-.002a3 3 0 0 1-1.09-.329l-.024-.01a3 3 0 0 1-.196-.118l-.057-.034a3 3 0 0 1-.826-.826l-.034-.057A3 3 0 0 1 6 20v-9.788a5 5 0 0 1 .84-2.774l.656-.985.116-.188a3 3 0 0 0 .38-1.254L8 4.789V3a1 1 0 0 1 0-2zm-6 3.79-.014.368a5 5 0 0 1-.632 2.09l-.194.314-.656.985A3 3 0 0 0 8 10.212v3.438c.492-.1.995-.153 1.5-.153l.371.009a7.5 7.5 0 0 1 2.516.571c.669.28 1.387.425 2.113.425l.271-.007q.627-.031 1.229-.205v-4.08a3 3 0 0 0-.388-1.475l-.116-.188-.656-.985A5 5 0 0 1 14 4.789V3h-4z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBottleMilk
