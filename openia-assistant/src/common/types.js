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
 * @property {string} content The content of the message.
 * @property {Array<TTask>} [tool_calls] An optional array of tool calls.
 */

/**
 * Represents a tool call with an ID, function, and arguments.
 * @typedef {Object} TTask
 * @property {string} id The unique identifier of the tool call.
 * @property {string} type The type of the tool call: function | etc.
 * @property {TAction} function The function called by the tool.
 */

/**
 * Represents a function called by a tool with a name and arguments.
 * @typedef {Object} TAction
 * @property {string} name The name of the function.
 * @property {Record<string, any>|string} arguments The arguments passed to the function.
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
 * @property {Record<string,string>} roles  
 */

export default {};