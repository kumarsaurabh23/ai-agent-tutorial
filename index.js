import OpenAI from "openai";
import readlineSync from "readline-sync"

const OPENAI_API_KEY = "" // put client key value

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Tools
function getWeather(city = '') {
  if(city.toLowerCase() === "chesterfield") {
    return `The weather in ${city} is 89 fahrenheit.`;
  } else if(city.toLowerCase() === "o'fallon") {
    return `The weather in ${city} is 90 fahrenheit.`;
  } else if(city.toLowerCase() === "st. peters") {
    return `The weather in ${city} is 91 fahrenheit.`;
  } else if(city.toLowerCase() === "st. charles") {
    return `The weather in ${city} is 92 fahrenheit.`;
  } else if(city.toLowerCase() === "st. louis") {
    return `The weather in ${city} is 93 fahrenheit.`;
  } else {
    return `I don't know the weather in ${city}.`;
  }
}

const tools = {
    "getWeather": getWeather
}

const SYSTEM_PROMPT = `
You are a AI assistant with START, PLAN, ACTION, OBSERVATION and Output Statement.
Wait for the user prompt and first PLAN using the tools available to you.
After planning, you will take an ACTION based on availabe tools and wait for the OBSERVATION.
Once you have the OBSERVATION, respond with an Output Statement based on the START prompt and OBSERVATION.

Strictly follow JSON output format as in Examples

Available tools:
- function getWeather(city: string) : string
getWeather is a function that accepts a city name and returns the weather in that city.

Example:

START
{"type": "user", "user": "What is the weather in o'fallon?"}
{"type": "plan", "plan": "I will call the getWeather for o'fallon"}
{"type": "action", "function": "getWeather", "input": "o'fallon"}
{"type": "observation", "observation": "The weather in o'fallon is 90 fahrenheit."}
{"type": "output", "output": "The weather in o'fallon is 90 fahrenheit."}

`;

const user = "What is the weather in chesterfield?";

// async function chat() {
//     const response = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//         { role: "system", content: SYSTEM_PROMPT},
//         { role: "developer", content: '{"type": "plan", "plan": "I will call the getWeather function for chesterfield."}'},
//         { role: "developer", content: '{"type": "action", "function": "getWeather", "input": "chesterfield"}'},
//             { role: "user", content: user }
//             ]
//         });

//     console.log(response.choices[0].message.content);
// }

// chat();

const messages = [ { role: "system", content: SYSTEM_PROMPT} ];

while(true) {
    const query = readlineSync.question('>> ');
    const msg = {
        type: 'user',
        content: query
    }
    messages.push( { role: 'user', content: JSON.stringify(msg) } );
    while(true) {
        const chat = await openai.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages: messages,
                            response_format: { type: 'json_object'}
        });        

        const result = chat.choices[0].message.content;
        messages.push( { role: 'assistant', content: result } );

        console.log(`\n\n--------------- START AI ---------------`);
        console.log(result);
        console.log(`--------------- END AI ---------------\n\n`);

        const call = JSON.parse(result);
        if(call.type === 'output') {
            console.log(`bot: ${call.output}`);
            break;
        } else if( call.type === 'action') {
            const fn = tools[call.function];
            const observation = fn(call.input);    
            const obs = {"type": "observation", "observation": observation};
            messages.push({role: 'developer', content: JSON.stringify(obs)});
        }
    }
}
    
    
