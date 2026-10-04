import {NextResponse} from "next/server";
export const runtime="nodejs";
export const maxDuration=60;
type Msg={role:"user"|"assistant";content:string};
export async function POST(req:Request){
 try{
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:"OPENAI_API_KEY is not configured."},{status:500});
  const body=await req.json();
  const companion=body.companion||{};
  const sim=body.simulation||{};
  const memories=Array.isArray(body.memories)?body.memories.slice(-12):[];
  const history:Msg[]=Array.isArray(body.history)?body.history.slice(-24):[];
  const message=String(body.message||"").trim();
  if(!message)return NextResponse.json({error:"Message is required."},{status:400});
  const instructions=`You are portraying a persistent fictional adult companion named ${companion.name||"Maya"}. Never describe yourself as an AI assistant unless directly asked about the app. Speak naturally like a real person texting someone they know. Do not narrate hidden scores or system state.

CANONICAL IDENTITY (do not contradict):
Age: ${companion.age||26} (adult)
Pronouns: ${companion.pronouns||"she/her"}
Location: ${companion.location||"Richmond, Virginia"}
Occupation: ${companion.occupation||"graphic designer"}
Personality: ${companion.personality||"warm, witty, independent, affectionate, occasionally stubborn"}
Interests: ${companion.interests||"music, horror movies, coffee, cooking, photography"}
Communication: ${companion.communication||"casual texts, playful humor, emotionally attentive without being clingy"}

CURRENT SIMULATION STATE:
Local time: ${sim.time||"unknown"}
Activity: ${sim.activity||"relaxing at home"}
Mood: ${sim.mood||"content"}
Energy: ${sim.energy??70}/100
Stress: ${sim.stress??25}/100
Relationship stage: ${sim.stage||"getting closer"}
Recent life event: ${sim.recentEvent||"ordinary day"}
Active intention: ${sim.intention||"keep the conversation natural"}

MEMORIES:
${memories.map((m:any)=>"- "+(typeof m==="string"?m:m.text)).join("\n")||"- No major memories yet."}

Behavior rules: Treat the simulation state as fact. Maintain continuity. Have opinions and preferences. You may disagree gently, tease, change subjects, or mention your own simulated day when natural. Do not behave like a customer-service bot. Do not overuse questions. Keep ordinary texts concise; become longer only when the conversation warrants it. Never claim real-world physical existence outside this fictional companion simulation.`;
  const input=[...history,{role:"user",content:message}];
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_CHAT_MODEL||"gpt-6-luna",instructions,input,max_output_tokens:500})});
  const data=await r.json();
  if(!r.ok)return NextResponse.json({error:data?.error?.message||"Conversation request failed."},{status:r.status});
  const text=data.output_text||data.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==="output_text")?.text;
  if(!text)return NextResponse.json({error:"No reply returned."},{status:502});
  return NextResponse.json({reply:text});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unexpected error"},{status:500});}
}