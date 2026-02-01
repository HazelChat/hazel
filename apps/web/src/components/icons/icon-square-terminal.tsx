import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconSquareTerminal({
	fill = "currentColor",
	title = "square terminal",
	...props
}: IconProps) {
	return (
		<svg
			height="18"
			width="18"
			data-slot="icon"
			viewBox="0 0 18 18"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<path
					d="M13.25,2H4.75c-1.517,0-2.75,1.233-2.75,2.75V13.25c0,1.517,1.233,2.75,2.75,2.75H13.25c1.517,0,2.75-1.233,2.75-2.75V4.75c0-1.517-1.233-2.75-2.75-2.75ZM6.28,12.78c-.146,.146-.338,.22-.53,.22s-.384-.073-.53-.22c-.293-.293-.293-.768,0-1.061l1.97-1.97-1.97-1.97c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l2.5,2.5c.293,.293,.293,.768,0,1.061l-2.5,2.5Zm5.97,.22h-2.5c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75h2.5c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconSquareTerminal
