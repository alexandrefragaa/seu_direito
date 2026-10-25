import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const ROOT = "https://resultados.tse.jus.br/oficial/ele2026";
const UFS = new Set(["ac","al","ap","am","ba","ce","df","es","go","ma","mt","ms","mg","pa","pb","pr","pe","pi","rj","rn","rs","ro","rr","sc","sp","se","to"]);
const CARGOS = new Set(["0001","0003","0005","0006","0007","0008"]);
const elections: Record<string, { label: string; turn: number }> = {
 "6257": { label: "Eleições Gerais 2026 — 1º turno", turn: 1 },
 "6258": { label: "Eleições Gerais 2026 — 2º turno", turn: 2 },
 "6259": { label: "Eleições estaduais 2026 — 1º turno", turn: 1 },
 "6260": { label: "Eleições estaduais 2026 — 2º turno", turn: 2 }
};
const fmtElection = (e: string) => e.padStart(6, "0");
const fmtCode = (s: string) => s.padStart(5, "0");
export async function GET(request: NextRequest) {
 const p=request.nextUrl.searchParams, scope=p.get("scope")||"br", uf=(p.get("uf")||"sp").toLowerCase(), cargo=p.get("cargo")||"0001", requestedElection=p.get("election")||"6258", turn=Number(p.get("turn")||elections[requestedElection]?.turn||2), municipality=p.get("municipio")||"";
 if(!["br","uf","mu","zz","extmu"].includes(scope)) return NextResponse.json({error:"Localidade inválida."},{status:400});
 if(!CARGOS.has(cargo)) return NextResponse.json({error:"Cargo inválido."},{status:400});
 if(!elections[requestedElection]||elections[requestedElection].turn!==turn) return NextResponse.json({error:"Combinação de eleição e turno indisponível."},{status:400});
 if((scope==="uf"||scope==="mu")&&!UFS.has(uf)) return NextResponse.json({error:"Estado inválido."},{status:400});
 if(scope==="mu"&&!/^\d{5}$/.test(municipality)) return NextResponse.json({error:"Selecione um município da lista."},{status:400});
 if((scope==="br"||scope==="zz"||scope==="extmu")&&cargo!=="0001") return NextResponse.json({error:"No Brasil e no exterior, selecione Presidente."},{status:400});
 const election = cargo==="0001" ? (turn===1?"6257":"6258") : (turn===1?"6259":"6260");
 const region=scope==="br"?"br":(scope==="zz"||scope==="extmu")?"zz":uf;
 let filename=`${region}-c${cargo}-e${fmtElection(election)}-u.json`;
 let scopeName=scope==="br"?"Brasil":(scope==="zz"||scope==="extmu")?"Exterior":uf.toUpperCase();
 if(scope==="mu"){ filename=`${uf}${fmtCode(municipality)}-c${cargo}-e${fmtElection(election)}-u.json`; scopeName=`${uf.toUpperCase()} · município ${municipality}`; }
 if(scope==="extmu"){ filename=`zz${fmtCode(municipality)}-c${cargo}-e${fmtElection(election)}-u.json`; scopeName=`Exterior · localidade ${municipality}`; }
 const url=`${ROOT}/${election}/dados/${region}/${filename}`;
 try {
  const response=await fetch(url,{cache:"no-store",headers:{accept:"application/json"},signal:AbortSignal.timeout(12000)});
  if(!response.ok) return NextResponse.json({error:response.status===404?"O TSE ainda não disponibilizou esse arquivo para a eleição, cargo ou localidade escolhida.":`A fonte oficial respondeu HTTP ${response.status}.`,source:url},{status:response.status===404?404:502});
  const raw=await response.json(), cargoRows=Array.isArray(raw.carg)?raw.carg:[], cargoData=cargoRows.find((x:any)=>String(x.cd).padStart(4,"0")===cargo)||cargoRows[0], candidates:any[]=[];
  for(const agr of (cargoData?.agr||[])) for(const par of (agr.par||[])) for(const cand of (par.cand||[])) candidates.push({name:cand.nm||cand.nmu||"Candidato sem nome",ballotName:cand.nmu||cand.nm||"Candidato",party:par.sg||"",number:String(cand.n??""),votes:Number(cand.vap||0),percent:Number(cand.pvap||0),photo:cand.sqcand?`${ROOT}/${election}/fotos/${region}/${cand.sqcand}.jpeg`:null,situation:cand.st||""});
  candidates.sort((a,b)=>b.votes-a.votes);
  // Do not expose cached/pre-publication totals for the second round before the stated 19:00 BRT publication gate.
  const localNow = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo", hour12: false });
  const publicationPending = election === "6258" && localNow < "2026-10-25 19:00:00";
  const visibleCandidates = publicationPending ? candidates.map(c => ({ ...c, votes: 0, percent: 0 })) : candidates;
  const totalSections=Number(raw.s?.ts||0), countedSections=Number(raw.s?.st||0);
  const stats=publicationPending
   ? {countedSections:0,totalSections,countedPercent:0,voters:0,validVotes:0,blankVotes:0,nullVotes:0,abstentions:0,electorate:Number(raw.e?.te||0),generation:"Aguardando horário de divulgação",finalized:false}
   : {countedSections,totalSections,countedPercent:totalSections>0?Number(raw.s?.pst||(countedSections/totalSections*100)):0,voters:Number(raw.e?.c||0),validVotes:Number(raw.v?.vv||0),blankVotes:Number(raw.v?.vb||0),nullVotes:Number(raw.v?.vn||0)+Number(raw.v?.vnt||0),abstentions:Number(raw.e?.a||0),electorate:Number(raw.e?.te||0),generation:[raw.dg,raw.hg].filter(Boolean).join(" "),finalized:raw.and==="f"};
  return NextResponse.json({source:url,updatedAt:new Date().toISOString(),scopeName,electionName:elections[election].label,election,turn,cargo:cargoData?.nmn||cargoData?.nmm||cargoData?.nmf||cargo,candidates:visibleCandidates,stats,publicationPending,raw:{ele:raw.ele,idg:raw.idg,dg:raw.dg,hg:raw.hg,tpabr:raw.tpabr,cdabr:raw.cdabr,and:raw.and,tf:raw.tf}},{headers:{"Cache-Control":"no-store, max-age=0"}});
 } catch { return NextResponse.json({error:"Não foi possível conectar à fonte oficial do TSE neste momento. Tente novamente.",source:url},{status:502}); }
}