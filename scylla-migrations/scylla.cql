CREATE KEYSPACE chat WITH replication = {'class': 'org.apache.cassandra.locator.SimpleStrategy', 'replication_factor': '3'} AND durable_writes = true AND tablets = {'enabled': false};

CREATE TABLE chat.messages (
    id timeuuid,
    attached_files list<text>,
    author_id text,
    channel_id text,
    content text,
    created_at timestamp,
    reply_to_message_id timeuuid,
    thread_channel_id text,
    updated_at timestamp,
    PRIMARY KEY (id)
)

CREATE MATERIALIZED VIEW chat.messages_by_channel AS
    SELECT channel_id, id, attached_files, author_id, content, created_at, reply_to_message_id, thread_channel_id, updated_at
    FROM chat.messages
    WHERE channel_id IS NOT null AND id IS NOT null
    PRIMARY KEY (channel_id, id)
    WITH CLUSTERING ORDER BY (id DESC)


