import { api } from "@hazel/backend/api"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"
import { convexQueryOptions } from "."

const _channelCollections = () =>
	createCollection(
		queryCollectionOptions({
			...convexQueryOptions(api.channels.list, {}),
			getKey: (channel) => channel._id,
		}),
	)
