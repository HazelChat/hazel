import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconTerminal({
	fill = "currentColor",
	secondaryfill,
	title = "terminal",
	...props
}: IconProps) {
	secondaryfill = secondaryfill || fill

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
					d="M14.25 16H3.75C2.507 16 1.5 14.993 1.5 13.75V4.25C1.5 3.007 2.507 2 3.75 2H14.25C15.493 2 16.5 3.007 16.5 4.25V13.75C16.5 14.993 15.493 16 14.25 16Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M5.47 6.47C5.177 6.763 5.177 7.237 5.47 7.53L6.94 9L5.47 10.47C5.177 10.763 5.177 11.237 5.47 11.53C5.617 11.677 5.808 11.75 6 11.75C6.192 11.75 6.383 11.677 6.53 11.53L8.53 9.53C8.823 9.237 8.823 8.763 8.53 8.47L6.53 6.47C6.237 6.177 5.763 6.177 5.47 6.47Z"
					fill={fill}
				/>
				<path
					d="M12.5 11H9.5C9.086 11 8.75 11.336 8.75 11.75C8.75 12.164 9.086 12.5 9.5 12.5H12.5C12.914 12.5 13.25 12.164 13.25 11.75C13.25 11.336 12.914 11 12.5 11Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconTerminal
