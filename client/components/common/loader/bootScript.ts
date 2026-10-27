import { sceneConfig as cfg } from "@/constants/scene.config";
import { LOADER } from "@/constants/loader";
import { poseAt, type Mode } from "@/utils/track";

const MODES: Mode[] = ["desktop", "tablet", "tabletPortrait", "mobile"];
/** Order matters: the script writes --ld-m*, --ld-r*, --ld-s* from these. */
const LAYERS = ["moon", "rays", "minisun"] as const;

/**
 * Inline <head> script, runs before first paint:
 *  - skips the loader if it already played this tab session;
 *  - otherwise pins the loader's eclipse onto the hero eclipse's viewport
 *    rect (--ld-{m,r,s}{x,y,w}: centre + width of moon, rays, mini sun),
 *    using the same cover-scale and layout-tier rules as app/page.tsx, so the
 *    exit iris hands over to an identical eclipse underneath.
 */
export function loaderBootScript(): string {
  const data = {
    key: LOADER.storageKey,
    once: LOADER.oncePerSession,
    frame: [cfg.frame.width, cfg.frame.height],
    // Same precedence as readMode() in app/page.tsx.
    queries: [cfg.tabletQuery, cfg.tabletPortraitQuery, cfg.mobileQuery],
    poses: Object.fromEntries(
      MODES.map((m) => [
        m,
        LAYERS.map((a) => {
          const p = poseAt(a, 0, m);
          return [p.x, p.y, p.w];
        }),
      ]),
    ),
  };
  return `(function(d){
var r=document.documentElement;
try{if(d.once&&sessionStorage.getItem(d.key)&&!/[?&]loader(=|&|$)/.test(location.search)){r.dataset.loaderSkip="1";return}}catch(e){}
function mode(){var q=d.queries;return matchMedia(q[0]).matches?"tablet":matchMedia(q[1]).matches?"tabletPortrait":matchMedia(q[2]).matches?"mobile":"desktop"}
function fit(){
var v=window.visualViewport,w=v?v.width:innerWidth,h=v?v.height:innerHeight,
s=Math.max(w/d.frame[0],h/d.frame[1]),ox=(w-d.frame[0]*s)/2,oy=(h-d.frame[1]*s)/2,p=d.poses[mode()];
["m","r","s"].forEach(function(k,i){
r.style.setProperty("--ld-"+k+"x",ox+p[i][0]*s+"px");
r.style.setProperty("--ld-"+k+"y",oy+p[i][1]*s+"px");
r.style.setProperty("--ld-"+k+"w",p[i][2]*s+"px");
});
}
fit();addEventListener("resize",fit);window.visualViewport&&visualViewport.addEventListener("resize",fit);
})(${JSON.stringify(data)})`;
}
