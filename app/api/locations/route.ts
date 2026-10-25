import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ROOT = "https://resultados.tse.jus.br/oficial/ele2026";
const UFS = new Set(["ac","al","ap","am","ba","ce","df","es","go","ma","mt","ms","mg","pa","pb","pr","pe","pi","rj","rn","rs","ro","rr","sc","sp","se","to"]);
export async function GET(request: NextRequest) {
 const p=request.nextUrl.searchParams, turn=p.get("turn")||"2", cargo=p.get("cargo")||"0001", uf=(p.get("uf")||"sp").toLowerCase();
 if(uf!=="zz"&&!UFS.has(uf)) return NextResponse.json({places:[]});
 const election=cargo==="0001"?(turn==="1"?"6257":"6258"):(turn==="1"?"6259":"6260");
 const url=`${ROOT}/${election}/config/mun-e${election.padStart(6,"0")}-cm.json`;
 try {
  const r=await fetch(url,{cache:"no-store",headers:{accept:"application/json"},signal:AbortSignal.timeout(10000)});
  if(!r.ok) return NextResponse.json({places:[],error:"Lista de municípios indisponível na fonte oficial."});
  const json=await r.json(), areas=Array.isArray(json.abr)?json.abr:[], area=areas.find((a:any)=>String(a.cd||a.sg||"").toLowerCase()===uf||String(a.cdabr||"").toLowerCase()===uf), municipalities=Array.isArray(area?.mu)?area.mu:[];
  const places=municipalities.map((m:any)=>({name:m.nm||m.nmu||String(m.cd||""),code:String(m.cd||"").padStart(5,"0"),uf})).filter((m:any)=>/^\d{5}$/.test(m.code)&&m.name).sort((a:any,b:any)=>a.name.localeCompare(b.name,"pt-BR"));
  return NextResponse.json({places},{headers:{"Cache-Control":"no-store, max-age=0"}});
 } catch { return NextResponse.json({places:[],error:"Não foi possível conectar à lista oficial de municípios."}); }
}