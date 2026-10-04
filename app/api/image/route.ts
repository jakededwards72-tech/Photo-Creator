import {NextResponse} from "next/server";
export const runtime="nodejs";
export const maxDuration=60;
const key=()=>process.env.OPENAI_API_KEY;
const model=()=>process.env.OPENAI_IMAGE_MODEL||"gpt-image-2";
export async function POST(req:Request){
 try{
  if(!key()) return NextResponse.json({error:"OPENAI_API_KEY is not configured."},{status:500});
  const form=await req.formData(); const prompt=String(form.get("prompt")||"").trim(); const mode=String(form.get("mode")||"create"); const size=String(form.get("size")||"1024x1024"); const quality=String(form.get("quality")||"medium");
  if(!prompt) return NextResponse.json({error:"Describe what you want."},{status:400});
  let res:Response;
  if(mode==="edit"){
   const image=form.get("image"); if(!(image instanceof File)) return NextResponse.json({error:"Upload an image to edit."},{status:400});
   const body=new FormData(); body.append("model",model()); body.append("prompt",prompt); body.append("image",image); body.append("size",size); body.append("quality",quality); body.append("output_format","png");
   res=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${key()}`},body});
  }else{
   res=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{Authorization:`Bearer ${key()}`,"Content-Type":"application/json"},body:JSON.stringify({model:model(),prompt,size,quality,output_format:"png"})});
  }
  const data=await res.json(); if(!res.ok) return NextResponse.json({error:data?.error?.message||"Image request failed."},{status:res.status});
  const b64=data?.data?.[0]?.b64_json; const url=data?.data?.[0]?.url; if(!b64&&!url) return NextResponse.json({error:"No image returned."},{status:502});
  return NextResponse.json({image:b64?`data:image/png;base64,${b64}`:url});
 }catch(e){console.error("Image route failed",e instanceof Error?e.name:"Unknown error");return NextResponse.json({error:"The image service failed. Check the server configuration and Vercel logs."},{status:500});}
}