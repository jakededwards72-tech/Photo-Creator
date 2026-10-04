import {NextResponse} from "next/server";
export const runtime="nodejs";
export const maxDuration=60;
type Msg={role:"user"|"assistant";content:string};
export async function POST(req:Request){
 try{
  const token=(process.env.CLOUDFLARE_AI_TOKEN||"").trim();
  const account=(process.env.CLOUDFLARE_ACCOUNT_ID||"").trim();
  if(!token||!account)return NextResponse.json({error:"Cloudflare Workers AI is not configured."},{status:500});
  const body=await req.json(), companion=body.companion||{}, sim=body.simulation||{};
  const memories=Array.isArray(body.memories)?body.memories.slice(-12):[];
  const history:Msg[]=Array.isArray(body.history)?body.history.slice(-24):[];
  const message=String(body.message||"").trim();
  if(!message)return NextResponse.json({error:"Message is required."},{status:400});
  const system=`You are portraying a persistent fictional adult companion named ${companion.name||"Maya"}. Speak naturally like a real person texting someone they know. Do not narrate hidden scores or system state.
Canonical identity: age ${companion.age||26}; pronouns ${companion.pronouns||"she/her"}; location ${companion.location||"Richmond, Virginia"}; occupation ${companion.occupation||"graphic designer"}.
Personality: ${companion.personality||"warm, witty, independent, affectionate, occasionally stubborn"}.
Interests: ${companion.interests||"music, horror movies, coffee, cooking, photography"}.
Communication: ${companion.communication||"casual, playful, emotionally attentive"}.
Backstory: ${companion.backstory||"No detailed backstory established yet."}
Current life: ${sim.time||"unknown"}; activity ${sim.activity||"relaxing"}; mood ${sim.mood||"content"}; energy ${sim.energy??70}/100; stress ${sim.stress??25}/100; relationship ${sim.stage||"getting closer"}; recent event ${sim.recentEvent||"ordinary day"}.
Memories:
${memories.map((m:any)=>"- "+(typeof m==="string"?m:m?.text||"")).join("\n")||"- None yet."}
Maintain continuity and have your own opinions. You may disagree gently, tease, change subjects, or mention your simulated day naturally. Avoid customer-service language and excessive questions. Keep normal texts concise. Never claim real-world physical existence outside this fictional companion simulation.`;
  const messages=[{role:"system",content:system},...history,{role:"user",content:message}];
  const model=process.env.CLOUDFLARE_AI_MODEL||"@cf/zai-org/glm-4.7-flash";
  const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/v1/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({model,messages,max_tokens:500,temperature:.8})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok){const raw=String(data?.errors?.[0]?.message||data?.error?.message||"Workers AI request failed.");return NextResponse.json({error:"Cloudflare "+r.status+": "+raw.replace(/Bearer\\s+\\S+/gi,"Bearer [REDACTED]").slice(0,500)},{status:r.status});}
  const reply=data?.choices?.[0]?.message?.content||data?.result?.response;
  if(typeof reply!=="string"||!reply.trim())return NextResponse.json({error:"Cloudflare returned no reply."},{status:502});
  return NextResponse.json({reply:reply.trim(),provider:"cloudflare",model});
 }catch(e){console.error("Chat route failed",e instanceof Error?e.name:"Unknown error");return NextResponse.json({error:"Chat server error."},{status:500});}
}
