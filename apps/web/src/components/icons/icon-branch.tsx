import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

function IconBranch({ fill = "currentColor", secondaryfill, title = "branch", ...props }: IconProps) {
	secondaryfill = secondaryfill || fill

	return (
		<svg height="18" width="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
			<title>{title}</title>
			<g fill={fill}>
				<path
					d="M2.75 5.5H5.17101C5.50501 5.5 5.81899 5.63 6.05499 5.866L8.46899 8.28003C8.61499 8.42603 8.80699 8.5 8.99899 8.5C9.19099 8.5 9.38301 8.42703 9.52901 8.28003C9.82201 7.98703 9.82201 7.51199 9.52901 7.21899L7.11501 4.80499C6.59501 4.28499 5.905 3.99899 5.17 3.99899H2.75C2.336 3.99899 2 4.33499 2 4.74899C2 5.16299 2.336 5.49899 2.75 5.49899V5.5Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M16.78 9.71996L14.03 6.96999C13.737 6.67699 13.262 6.67699 12.969 6.96999C12.676 7.26299 12.676 7.738 12.969 8.031L14.439 9.50097H0.75C0.336 9.50097 0 9.83697 0 10.251C0 10.665 0.336 11.001 0.75 11.001H14.439L12.969 12.471C12.676 12.764 12.676 13.239 12.969 13.532C13.115 13.678 13.307 13.752 13.499 13.752C13.691 13.752 13.883 13.679 14.029 13.532L16.779 10.782C17.072 10.489 17.072 10.014 16.779 9.721L16.78 9.71996Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconBranch
