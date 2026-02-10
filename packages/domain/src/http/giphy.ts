import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"
import { CurrentUser } from "../"

// ============ Response Schemas ============

export class GiphyImage extends Schema.Class<GiphyImage>("GiphyImage")({
	url: Schema.String,
	width: Schema.String,
	height: Schema.String,
}) {}

export class GiphyImages extends Schema.Class<GiphyImages>("GiphyImages")({
	fixed_width: GiphyImage,
	fixed_width_still: GiphyImage,
	original: GiphyImage,
}) {}

export class GiphyGif extends Schema.Class<GiphyGif>("GiphyGif")({
	id: Schema.String,
	title: Schema.String,
	url: Schema.String,
	images: GiphyImages,
}) {}

export class GiphySearchResponse extends Schema.Class<GiphySearchResponse>("GiphySearchResponse")({
	data: Schema.Array(GiphyGif),
	pagination: Schema.Struct({
		total_count: Schema.Number,
		count: Schema.Number,
		offset: Schema.Number,
	}),
}) {}

export class GiphyCategory extends Schema.Class<GiphyCategory>("GiphyCategory")({
	name: Schema.String,
	name_encoded: Schema.String,
}) {}

export class GiphyCategoriesResponse extends Schema.Class<GiphyCategoriesResponse>("GiphyCategoriesResponse")(
	{
		data: Schema.Array(GiphyCategory),
	},
) {}

// ============ Error Schemas ============

export class GiphyApiError extends Schema.TaggedError<GiphyApiError>("GiphyApiError")(
	"GiphyApiError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 502,
	}),
) {}

// ============ API Group ============

export class GiphyGroup extends HttpApiGroup.make("giphy")
	.add(
		HttpApiEndpoint.get("trending", "/trending")
			.setUrlParams(
				Schema.Struct({
					offset: Schema.optionalWith(Schema.NumberFromString, { default: () => 0 }),
					limit: Schema.optionalWith(Schema.NumberFromString, { default: () => 25 }),
				}),
			)
			.addSuccess(GiphySearchResponse)
			.addError(GiphyApiError),
	)
	.add(
		HttpApiEndpoint.get("search", "/search")
			.setUrlParams(
				Schema.Struct({
					q: Schema.String,
					offset: Schema.optionalWith(Schema.NumberFromString, { default: () => 0 }),
					limit: Schema.optionalWith(Schema.NumberFromString, { default: () => 25 }),
				}),
			)
			.addSuccess(GiphySearchResponse)
			.addError(GiphyApiError),
	)
	.add(
		HttpApiEndpoint.get("categories", "/categories")
			.addSuccess(GiphyCategoriesResponse)
			.addError(GiphyApiError),
	)
	.prefix("/giphy")
	.middleware(CurrentUser.Authorization) {}
