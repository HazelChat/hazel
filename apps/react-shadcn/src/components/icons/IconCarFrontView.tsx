// icons/svgs/solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconCarFrontView: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g clip-path="url(#icon-gllkatnwu-a)">
				<path
					fill="currentColor"
					fillRule="evenodd"
					d="M8.136 4h7.728c.795 0 1.394 0 1.956.167a4 4 0 0 1 1.36.712c.457.367.798.86 1.25 1.514l1.582 2.285c.275.397.483.697.634 1.03l.001.004.184-.031a1 1 0 1 1 .338 1.971l-.17.029V19a3 3 0 0 1-6 0q-1.45.001-2.906.005c-2.362.005-4.729.01-7.093-.002A3 3 0 0 1 1 19v-7.32l-.17-.028a1 1 0 0 1 .34-1.971l.182.031.002-.003c.15-.334.358-.634.634-1.031L3.57 6.393c.452-.654.793-1.147 1.25-1.514a4 4 0 0 1 1.36-.712C6.74 3.999 7.34 4 8.136 4Zm12.371 6.019c-2.517.306-5.416.481-8.507.481s-5.99-.175-8.507-.481q.076-.113.183-.266L5.14 7.637c.558-.807.73-1.037.93-1.197a2 2 0 0 1 .68-.357C6.997 6.01 7.284 6 8.265 6h7.47c.981 0 1.268.01 1.514.083a2 2 0 0 1 .68.357c.2.16.372.39.93 1.197l1.465 2.116q.107.153.183.266ZM4.902 13.735a1 1 0 0 1 1.063-.933q.586.04 1.188.07a1 1 0 1 1-.106 1.998q-.614-.033-1.212-.072a1 1 0 0 1-.933-1.063Zm13.263 1.063a1 1 0 0 0-.13-1.996 98 98 0 0 1-1.188.07 1 1 0 0 0 .106 1.998q.614-.033 1.212-.072Z"
					clipRule="evenodd"
				/>
			</g>
			<defs>
				<clipPath id="icon-gllkatnwu-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconCarFrontView
