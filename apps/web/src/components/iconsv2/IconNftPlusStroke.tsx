// stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconNftPlusStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.521 21h-.775c-.773 0-1.33 0-1.778-.035M21.36 11h-2.322c-.935 0-1.402 0-1.796.034-4.381.38-7.855 3.83-8.238 8.182-.034.386-.035.843-.035 1.749M21.36 11c-.15-.519-.458-1.067-1.005-2.045l-1.49-2.663c-.67-1.198-1.004-1.797-1.481-2.233a4 4 0 0 0-1.466-.857C15.302 3 14.612 3 13.232 3h-2.486c-1.38 0-2.07 0-2.685.202a4 4 0 0 0-1.466.857c-.477.436-.812 1.035-1.482 2.233l-1.454 2.6c-.635 1.134-.952 1.702-1.076 2.302-.11.532-.11 1.08 0 1.612.124.6.441 1.168 1.076 2.302l1.454 2.6c.67 1.198 1.005 1.797 1.482 2.234.422.385.921.677 1.466.856a3.8 3.8 0 0 0 .907.167M21.36 11q.032.107.054.213c.111.522.116 1.06.014 1.585a3.7 3.7 0 0 1-.256.782M17.989 22v-3m0 0v-3m0 3h-3m3 0h3M8.97 10a1.003 1.003 0 0 1-1.01-1c0-.552.451-1 1.007-1s1.007.448 1.007 1-.45 1-1.007 1Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconNftPlusStroke
