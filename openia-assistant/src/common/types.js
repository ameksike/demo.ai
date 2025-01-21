/**
 * Message type definition in JsDoc format
 * @typedef  {Object} TMsg
 * @property {String} role
 * @property {String} content  
 */

/**
 * Represents a response
 * @typedef {Object} TResponse
 * @property {Array<TChoice>} choices The list of choices.
 */

/**
 * Represents a choice within a task.
 * @typedef {Object} TChoice
 * @property {TChoiceMessage} message The message associated with the choice.
 */

/**
 * Represents a message with content and optional tool calls.
 * @typedef {Object} TChoiceMessage
 * @property {String} content The content of the message.
 * @property {Array<TTask>} [tool_calls] An optional array of tool calls.
 */

/**
 * Represents a tool call with an ID, function, and arguments.
 * @typedef {Object} TTask
 * @property {String} [id] The unique identifier of the tool call.
 * @property {String} type The type of the tool call: function | etc.
 * @property {TAction} function The function called by the tool.
 */

/**
 * Represents a Connector type
 * @typedef {Object} TConnector
 * @property {String} [name] The unique identifier of the connector plugin.
 * @property {TTask} definition The Tool Call prototype definition.
 */

/**
 * Represents a function called by a tool with a name and arguments.
 * @typedef {Object} TAction
 * @property {String} name The name of the function.
 * @property {Record<String, any>|String} arguments The arguments passed to the function.
 */

/**
 * Data training and instructions 
 * @typedef  {Object} TTraining
 * @property {String} name
 * @property {String} instructions  
 */

/**
 * Provider AI Options
 * @typedef  {Object} TOption
 * @property {Boolean} stream
 * @property {String} model
 * @property {TTraining} training
 * @property {Array<TTask>} tools  
 */

/**
 * Provider AI Payload Options
 * @typedef  {Object} TAiPayload
 * @property {Console} logger
 * @property {Object} plugin 
 * @property {Array<TMsg>} thread  
 * @property {TOption} option  
 * @property {Record<String,String>} roles  
 */

export default {};