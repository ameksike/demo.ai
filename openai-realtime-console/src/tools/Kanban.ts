import { RealtimeClient } from "@openai/realtime-api-beta";

export function addToolMoveCard(client: RealtimeClient) {
    client.addTool(
        {
            name: 'move_card',
            description: 'Moves a Kanban card from one column to another.',
            parameters: {
                type: 'object',
                properties: {
                    card_id: {
                        type: 'string',
                        description: 'The id of the Kanban Card to move.',
                    },
                    column_id: {
                        type: 'string',
                        description: 'The id of the Kanban column to move the Card to. It could be "in_progress", "todo", "done", etc.',
                    },
                },
                required: ['card_id', 'column_id'],
            },
        },
        async ({ card_id, column_id }: { [key: string]: any }) => {
            console.log(" AGENT TOOL >>>>>>>>>> ", { card_id, column_id });
            window.parent.postMessage(
                {
                    type: "move_card",
                    card_id,
                    column_id,
                },
                "*"
            );
            return { ok: true };
        }
    );
}