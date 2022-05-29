var e=Object.defineProperty,t=Object.defineProperties,a=Object.getOwnPropertyDescriptors,n=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,r=(t,a,n)=>a in t?e(t,a,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[a]=n,c=(e,t)=>{for(var a in t||(t={}))l.call(t,a)&&r(e,a,t[a]);if(n)for(var a of n(t))s.call(t,a)&&r(e,a,t[a]);return e},o=(e,n)=>t(e,a(n));import{R as i,C as m,a as d,b as u}from"./vendor.b64713aa.js";function p(e){const{pokemon:t,id:a,setCounter:n,setEnemCounter:l,shouldSetEnemy:s,setPlayerSelectedIds:r,setEnemySelectedIds:c,setPlayerSelectedStats:o,setEnemySelectedStats:u}=e,[p,E]=m.exports.useState("stats"),[y,g]=m.exports.useState("SELECT"),[h,S]=m.exports.useState([]),[k,b]=m.exports.useState(!0);m.exports.useEffect((()=>{b(!0);let e=!0;return d.get(`https://pokeapi.co/api/v2/pokemon/${a}`).then((t=>{e&&(S(t.data),b(!1),s&&(c.current=[...c.current,a],u.current=[...u.current,t.data.stats],l((e=>e<=0?(c.current=c.current.filter((e=>e!==a)),e):e-1))))})),()=>e=!1}),[]);const f=()=>{if("stats"===p)E("stats-hover");else{if("stats-selected"===p)return;E("stats")}};return k?i.createElement("img",{src:"/public/assets/loading.gif",className:"loadingImg"}):i.createElement("div",{id:a,className:p,onMouseEnter:f,onMouseLeave:f},i.createElement("p",{className:"text"},t.name),i.createElement("img",{src:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${a}.png`,alt:"no img",className:"image",loading:"lazy"}),i.createElement("ul",{className:"detailStats"},h.stats.map(((e,t)=>{const a=e.stat.name;return i.createElement("li",{key:t},a,i.createElement("span",{className:"detailStatsValue"},["defense","special-attack","special-defense","speed"].includes(a)?~~(e.base_stat/2)+"%":e.base_stat))})),i.createElement("li",null,"Types:",h.types.map(((e,t)=>i.createElement("span",{className:"detailStatsValue",key:t}," ","+",e.type.name))))),i.createElement("button",{onClick:()=>{"stats-selected"==p?(E("stats-hover"),g((e=>"SELECT")),n((e=>e+1)),r.current=r.current.filter((e=>e!==a)),o.current=o.current.filter((e=>e!==h.stats))):(E("stats-selected"),g((e=>"DESELECT")),n((e=>e-1)),r.current=[...r.current,a],o.current=[...o.current,h.stats])},className:"selectButton"},y))}const E=()=>{const e=Array.from({length:3},(()=>Math.floor(100*Math.random())));return e[1]!==e[2]&&e[2]!==e[3]&&e[1]!==e[3]?e:E()};function y(e){const t=E();return i.createElement("div",{id:"statsWrapper"},e.pokemonStats.map((a=>{let n=a.url.split("/")[6];return i.createElement(p,{key:n,id:n,pokemon:a,setCounter:e.setFunction,setEnemCounter:e.setEnemyFunction,shouldSetEnemy:t.includes(parseInt(n,10)-1),setPlayerSelectedIds:e.setPlayerSelectedIds,setEnemySelectedIds:e.setEnemySelectedIds,setPlayerSelectedStats:e.setPlayerSelectedStats,setEnemySelectedStats:e.setEnemySelectedStats})})))}function g(e){const{count:t,enemCount:a,setStart:n}=e,[l,s]=m.exports.useState(!1);return i.createElement("div",{className:"counter"},t<0?i.createElement("h1",null,"You can only select 3 pokemons"):i.createElement("h1",null,"You have ",t," pokemons left to select"),0===a?i.createElement("h3",null,"The enemy is ready"):i.createElement("h3",null,"The enemy have ",a," pokemons left to select"),0===t&&0===a?i.createElement("button",{className:"goButton",onClick:()=>n(!0)},"GO"):i.createElement("button",{className:"goButton",disabled:!0},"NOT READY"),i.createElement("div",{className:"question",onMouseEnter:()=>s(!0),onMouseLeave:()=>s(!1)},"?"),l?i.createElement("div",{className:"helpMsgBox"},i.createElement("ul",null,i.createElement("li",null,i.createElement("b",null,"Health:")," the Hp, a pokemon dies when this reaches 0"),i.createElement("li",null,i.createElement("b",null,"Attack Multiplier:")," the damage it can deal, n/20 <= f(n) <= 3n/10, n is this number"),i.createElement("li",null,i.createElement("b",null,"Defense:")," chance to resist 25% of incoming damage"),i.createElement("li",null,i.createElement("b",null,"SP Attack:")," chance to deal 50% more damage"),i.createElement("li",null,i.createElement("b",null,"SP Defense:")," chance to resist 50% of incoming damage"),i.createElement("li",null,i.createElement("b",null,"Speed:")," chance to dodge an attack, taking 0 damage"))):null)}function h(e){const{side:t,shouldShow:a,stats:n}=e,l=m.exports.useRef(n.hp);return i.createElement(i.Fragment,null,a?i.createElement("div",{className:t+"Details"},"Health:  ",i.createElement("label",{htmlFor:t+"Hp"},n.hp<=0?"DEFEATED":n.hp),i.createElement("progress",{id:t+"Hp",className:n.hp<60?n.hp<25?"bar under25":"bar under60":"bar",value:n.hp,max:l.current}),"Energy:  ",i.createElement("label",{htmlFor:t+"Eg"},n.eg<=0?"DEPLETED":n.eg),i.createElement("progress",{id:t+"Eg",className:n.eg<60?n.eg<25?"bar under25":"bar under60":"bar",value:n.eg,max:"100"})):null)}function S(e){const{id:t,stats:a,setAttacker:n,idx:l,isSelected:s,setIsSelected:r,isAlive:c}=e,[o,d]=m.exports.useState(!1);return i.createElement("div",{className:s?"playerSelected":"player",onMouseEnter:()=>d(!0),onMouseLeave:()=>d(!1),onClick:()=>{n(t),r((e=>(e[l]&&n(null),e.slice().fill(!1).fill(!e[l],l,l+1))))}},i.createElement("img",{className:c?"alive":"isDead",src:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${t}.png`,alt:"err"}),i.createElement(h,{side:"player",shouldShow:o,stats:a,id:t}),i.createElement("div",{key:a.modalContent,className:"popup player"},a.modalContent))}function k(e){const{id:t,stats:a,setTarget:n,idx:l,isSelected:s,setIsSelected:r,isAlive:c}=e,[o,d]=m.exports.useState(!1);return i.createElement("div",{className:s?"enemySelected":"enemy",onMouseEnter:()=>d(!0),onMouseLeave:()=>d(!1),onClick:()=>{n(t),r((e=>(e[l]&&n(null),e.slice().fill(!1).fill(!e[l],l,l+1))))}},i.createElement("img",{className:c?"alive":"isDead",src:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${t}.png`,alt:"err"}),i.createElement(h,{side:"enemy",shouldShow:o,stats:a,id:t}),i.createElement("div",{key:a.modalContent,className:"popup"},a.modalContent))}function b(e){const{isWin:t,battleLog:a}=e;return i.createElement("div",{className:"gameOver"},i.createElement("h1",null,"You ",t?"Win":"Lost","!"),i.createElement("hr",null),i.createElement("div",{className:"options"},i.createElement("button",{onClick:()=>window.location.reload()},"Start Another Game"),i.createElement("button",{onClick:()=>window.close()},"Quit")),i.createElement("details",{className:"battleEndLog"},i.createElement("summary",null,"Below is your battle log:"),i.createElement("pre",null,a)))}function f(e){const{isAllControlsAvailable:t,isAttackAvailableArr:a,isSelectedEnemyAlive:n,isSelectedPlayerAlive:l,hasPlayerActed:s,selectedAttackerAttackVal:r,attackFunction:c}=e;return i.createElement(i.Fragment,null,t?i.createElement("div",{className:"controls"},Array(3).fill(null).map(((e,t)=>i.createElement(i.Fragment,{key:t},a[t]?i.createElement("button",{"data-attack":t+1,onClick:c,"data-tip-text":0===t?`Damage: ${~~(.05*r)} - ${~~(.1*r)} HP\n Costs: 7 - 15 EG`:1===t?`Damage: ${~~(.1*r)} - ${~~(.2*r)} HP\n Costs: 16 - 25 EG`:2===t?`Damage: ${~~(.2*r)} - ${~~(.3*r)} HP\n Costs: 26 - 35 EG`:void 0},"Attack ",t+1):i.createElement("button",{key:t,disabled:!0,"data-tip-text":"Not enough energy to use this move!"},"Attack ",t+1))))):i.createElement("div",{className:"controls"},Array(3).fill(null).map(((e,t)=>i.createElement("button",{key:t,disabled:!0,"data-tip-text":!1===n?"The selected enemy has been killed!":s?"Already acted this turn!":!1===l?"This member has died!":"Need to select a target and an attacker!"},"Attack ",t+1)))))}function v(e,t){return Math.floor(Math.random()*(Math.ceil(t)-Math.floor(e)+1)+Math.ceil(e))}function A(e,t,a=!1){return a?e.enemys.filter((e=>e.id===t))[0]:e.players.filter((e=>e.id===t))[0]}function x(e){return 100*Math.random()<=e}function I(e){return new Promise((t=>setTimeout(t,1e3*e)))}const N=(e,t)=>{var a,n,l,s,r,i;const m=null==(l=A(e,null==(a=t.payload)?void 0:a.attackerId,null==(n=t.payload)?void 0:n.isEnemyAttacking))?void 0:l.attack;let d,u;switch(1===(null==(s=t.payload)?void 0:s.attackType)?(d=v(7,15),u=v(.05*m,.1*m)):2===(null==(r=t.payload)?void 0:r.attackType)?(d=v(16,25),u=v(.1*m,.2*m)):3===(null==(i=t.payload)?void 0:i.attackType)&&(d=v(26,35),u=v(.2*m,.3*m)),t.type){case"ATTACK":return console.log("standard attack"),T(e,d,u,t.payload.targetId,t.payload.attackerId,t.payload.isEnemyAttacking,u.toString());case"MISSED":return console.log("missed"),T(e,d,0,t.payload.targetId,t.payload.attackerId,t.payload.isEnemyAttacking,"MISSED");case"ATTACK_SP":console.log("1.5x attack");const a=~~(1.5*u);return T(e,d,a,t.payload.targetId,t.payload.attackerId,t.payload.isEnemyAttacking,`CRIT \n${a}`);case"DEFENDED":console.log("resisted");const n=~~(.75*u);return T(e,d,n,t.payload.targetId,t.payload.attackerId,t.payload.isEnemyAttacking,`RESIST \n${n}`);case"DEFENDED_SP":console.log("damage halved");const l=~~(.5*u);return T(e,d,l,t.payload.targetId,t.payload.attackerId,t.payload.isEnemyAttacking,`SHIELDED \n${l}`);case"CLOSE_MODAL":return{players:e.players.map((e=>o(c({},e),{modalContent:""}))),enemys:e.enemys.map((e=>o(c({},e),{modalContent:""})))};case"REFILL":return console.log("refilled"),T(e,-10,0,null,t.payload.attackerId,t.payload.isEnemyAttacking,"");default:throw new Error("shit, wrong action type")}};function T(e,t,a,n,l,s,r){let i,m;s?(i="enemys",m="players"):(i="players",m="enemys");return{[i]:e[i].map((e=>e.id===l?o(c({},e),{eg:e.eg-t}):e)),[m]:e[m].map((e=>e.id===n?o(c({},e),{hp:e.hp-a,modalContent:r}):e))}}function C(e){var t;const{playerIds:a,enemyIds:n,playerStats:l,enemyStats:s}=e,r={players:l.current.map(((e,t)=>({id:a.current[t],hp:e[0].base_stat,eg:100,attack:e[1].base_stat,def:e[2].base_stat/2,spAttack:e[3].base_stat/2,spDef:e[4].base_stat/2,speed:e[5].base_stat/2,modalContent:""}))),enemys:s.current.map(((e,t)=>({id:n.current[t],hp:e[0].base_stat,eg:100,attack:e[1].base_stat,def:e[2].base_stat/2,spAttack:e[3].base_stat/2,spDef:e[4].base_stat/2,speed:e[5].base_stat/2,modalContent:""})))},[d,u]=m.exports.useReducer(N,r),[p,E]=m.exports.useState(null),[y,g]=m.exports.useState(null),[h,T]=m.exports.useState([!1,!1,!1]),[C,D]=m.exports.useState([!1,!1,!1]),[P,w]=m.exports.useState([!0,!0,!0]),[L,M]=m.exports.useState({[d.enemys[0].id]:!0,[d.enemys[1].id]:!0,[d.enemys[2].id]:!0}),[F,O]=m.exports.useState({[d.players[0].id]:!1,[d.players[1].id]:!1,[d.players[2].id]:!1}),[_,R]=m.exports.useState({[d.players[0].id]:!0,[d.players[1].id]:!0,[d.players[2].id]:!0}),[$,j]=m.exports.useState("ongoing"),[H,Y]=m.exports.useState(!1),[W,B]=m.exports.useState("");m.exports.useEffect((()=>{var e;w((e=>e.slice().fill(!0)));const t=null==(e=A(d,y))?void 0:e.eg;t<15?w((e=>e.slice().fill(!1))):t<25?w([!0,!1,!1]):t<35&&w([!0,!0,!1])}),[y,d.players]),m.exports.useEffect((()=>{var e;(null==(e=A(d,p,!0))?void 0:e.hp)<=0&&M((e=>o(c({},e),{[p]:!1})))}),[p,d.enemys]),m.exports.useEffect((()=>{d.players.forEach((e=>{e.hp<=0&&R((t=>o(c({},t),{[e.id]:!1})))}))}),d.players.map((e=>e.hp))),m.exports.useEffect((()=>{setTimeout((()=>{u({type:"CLOSE_MODAL"})}),1e3)}),[...d.players.map((e=>e.eg)),...d.enemys.map((e=>e.eg))]),m.exports.useEffect((()=>{Object.values(L).includes(!0)||setTimeout((()=>{j("win")}),1500),Object.values(_).includes(!0)||setTimeout((()=>{j("lose")}),1500)}),[L,_]);const G=(e,t,a,n=!1)=>{const l=A(d,t,!n),s=A(d,a,n),r=l.speed,i=l.def,m=l.spDef,p=s.spAttack;let E;x(r)?(E="MISSED",B((e=>(n?"The Enemy":"You")+" missed the target\n\n"+e))):x(i)?(E="DEFENDED",B((e=>(n?"You":"The Enemy")+" defended the attack\n\n"+e))):x(p)?(E="ATTACK_SP",B((e=>(n?"The Enemy":"You")+" dealed critical damage\n\n"+e))):x(m)?(E="DEFENDED_SP",B((e=>(n?"You":"The Enemy")+" shielded the attack\n\n"+e))):(E="ATTACK",B((e=>(n?"The Enemy":"You")+" attacked normally\n\n"+e)));u({type:E,payload:{attackType:e,targetId:t,attackerId:a,isEnemyAttacking:n}}),n||O((e=>o(c({},e),{[y]:!0})))};return"win"===$?i.createElement(b,{isWin:!0,battleLog:W}):"lose"===$?i.createElement(b,{isWin:!1,battleLog:W}):i.createElement(i.Fragment,null,i.createElement("h1",{className:"battleTitle"},"Battle Started!"),i.createElement("div",{className:"battleQuestion",onMouseEnter:()=>Y(!0),onMouseLeave:()=>Y(!1)},"?"),H?i.createElement("div",{className:"battleHelpMsgBox"},i.createElement("ul",null,i.createElement("li",null,i.createElement("b",null,"Selecting:")," a member on both the player and enemy sides must be selected to proceed"),i.createElement("li",null,i.createElement("b",null,"Attacking:")," use the Attack 1-3 buttons, each represents 'weak', 'medium', 'strong' respectively"),i.createElement("li",null,i.createElement("b",null,"Turns:")," each member can only act once per turn"),i.createElement("li",null,i.createElement("b",null,"End turn:")," will trigger the enemy's moves, members that did not act this turn will get an refill of EG"),i.createElement("li",null,i.createElement("b",null,"Winning/losing:")," if all of the members on a side has died, the game will end"))):null,i.createElement("div",{className:"battleUiWindow"},i.createElement("div",{className:"playerWrap"},d.players.map(((e,t)=>i.createElement(S,{id:a.current[t],key:t,stats:e,setAttacker:g,idx:t,isSelected:C[t],setIsSelected:D,isAlive:_[a.current[t]]}))),i.createElement(f,{isAllControlsAvailable:C.includes(!0)&&h.includes(!0)&&L[p]&&_[y]&&!F[y],isAttackAvailableArr:P,isSelectedEnemyAlive:L[p],isSelectedPlayerAlive:_[y],hasPlayerActed:F[y],selectedAttackerAttackVal:null==(t=A(d,y))?void 0:t.attack,attackFunction:e=>G(parseInt(e.target.dataset.attack,10),p,y)})),i.createElement("div",{className:"enemyWrap"},i.createElement("div",{className:"controls"},i.createElement("button",{id:"endTurn","data-tip-text":"End the current turn: \nPokemons that did not\n attack will gain 10 EG",onClick:async()=>{O((e=>{const t=c({},e);return Object.keys(e).forEach((a=>{e[a]||(B((e=>"Your members has refilled some energy\n\n"+e)),u({type:"REFILL",payload:{attackerId:a,isEnemyAttacking:!1}})),t[a]=!1})),t}));for(let e=0;e<3;e++){const t=d.enemys[e];if(!L[t.id])continue;const a=d.players.filter((e=>e.hp>0));let n=3;t.eg<35&&(n=2),t.eg<25&&(n=1),t.eg<15||10===v(1,20)?(B((e=>"The enemy's members has refilled some energy\n\n"+e)),u({type:"REFILL",payload:{attackerId:t.id,isEnemyAttacking:!0}})):(G(v(1,n),a[v(0,a.length-1)].id,d.enemys[e].id,!0),await I(2))}}},"End Turn")),d.enemys.map(((e,t)=>i.createElement(k,{id:n.current[t],key:t,stats:e,setTarget:E,idx:t,isSelected:h[t],setIsSelected:T,isAlive:L[n.current[t]]}))))),i.createElement("textarea",{id:"battleLog",rows:"10",value:W,readOnly:!0}))}const D=()=>{const[e,t]=m.exports.useState([]),[a,n]=m.exports.useState(!0);m.exports.useEffect((()=>{n(!0),d.get("https://pokeapi.co/api/v2/pokemon/?limit=100").then((e=>{n(!1),t(e.data.results)}))}),[]);const[l,s]=m.exports.useState(3),[r,c]=m.exports.useState(3),[o,u]=m.exports.useState(!1),p=m.exports.useRef([]),E=m.exports.useRef([]),h=m.exports.useRef([]),S=m.exports.useRef([]);return a?i.createElement("div",{id:"loading"},"LOADING..."):o?i.createElement(C,{playerIds:p,enemyIds:E,playerStats:h,enemyStats:S}):i.createElement(i.Fragment,null,i.createElement(g,{count:l,enemCount:r,setStart:u}),i.createElement(y,{pokemonStats:e,setFunction:s,setEnemyFunction:c,setPlayerSelectedIds:p,setEnemySelectedIds:E,setPlayerSelectedStats:h,setEnemySelectedStats:S}))};u.render(i.createElement(i.StrictMode,null,i.createElement(D,null)),document.getElementById("root"));