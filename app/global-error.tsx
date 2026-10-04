"use client";
import {useEffect} from "react";
export default function GlobalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error("EVERA GLOBAL ERROR",error)},[error]);
 return <html><body style={{margin:0,background:"#09090c",color:"#eee",fontFamily:"system-ui",padding:"24px"}}>
 <div style={{maxWidth:760,margin:"80px auto",border:"1px solid #5c3445",borderRadius:16,padding:20,background:"#151116"}}>
 <div style={{fontSize:11,letterSpacing:2,color:"#d28ba7"}}>EVERA DEBUG</div><h1 style={{fontSize:24}}>Client crash captured</h1>
 <p style={{color:"#aaa"}}>Take a screenshot of everything in this box and send it to me.</p>
 <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:12,lineHeight:1.5,background:"#09090c",padding:14,borderRadius:10}}>{error?.name+"\n"+error?.message+"\n\n"+(error?.stack||"No stack available")+"\n\nDigest: "+(error?.digest||"none")}</pre>
 <button onClick={reset} style={{padding:"12px 16px",borderRadius:10,border:"1px solid #684356",background:"#38202c",color:"#fff"}}>Try again</button>
 </div></body></html>
}