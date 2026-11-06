export const companySpecs = [
 {slug:'atrox',alias:'ATROX',mark:'AT',related:[30,31,6],joke:'복지는 최고 수준, 내부 파벌도 다섯 갈래. 입사 안내보다 조직도를 먼저 읽게 될지도.',rumors:[]},
 {slug:'monotrix-arms',alias:'MonoTrix Arms',mark:'MT',related:[30,32,28],joke:'상명하복에 상급 복지. 기숙사에서 편히 쉬려면 일단 상사의 지시부터 끝내자.',rumors:['헤르만의 아들 그레고르의 변이설']},
 {slug:'cherno-orbital',alias:'Cherno Orbital',mark:'CO',related:[30,32,29],joke:'군수와 우주산업을 논하는 회사에 안주와 보드카 복지라니. 회식 메뉴 하나는 빨리 정해질 듯하다.',rumors:['“블랑코”라는 별명의 타 차원 언어적 의미']},
 {slug:'omega-paradigm',alias:'Omega-Paradigm',mark:'OP',related:[30,32,18],joke:'군수품부터 생활용품까지. 일단 사내 콜라 디스펜서 앞에서는 모두가 같은 갈증을 느낄 것이다.',rumors:['스티븐 Kim의 모친과 Arirang 이사회 관계설']},
 {slug:'arirang',alias:'Arirang',mark:'AR',related:[30,32,18,6],joke:'생필품은 대량유통, 기숙사는 한옥형. 미래 지하도시에서도 퇴근 뒤 마음만은 한옥으로.',rumors:['스티븐 Kim의 모친과 Arirang 이사회 관계설','이혜림과 닮은 여성의 11층 미니건 목격담']},
 {slug:'sakura-rain',alias:'Sakura Rain Inc.',mark:'SR',related:[30,32,18,6],joke:'수산업 회사의 자사 식당 무료 복지. 채용 공고보다 오늘의 메뉴가 먼저 궁금해진다.',rumors:['시즈카 린의 이혜림 그림 베개 목격담']},
 {slug:'omega-gol',alias:'Omega Gol',mark:'OG',related:[30,32,18],joke:'자사 상품 30% 할인은 확정. 군수산업 진출 이야기는 일단 이사회 쪽 표정부터 살펴보자.',rumors:['에밀리아가 군수산업 진출을 언급할 때마다 이사회가 말린다는 이야기','에밀리아의 콧수염 혐오']},
 {slug:'body-buddy',alias:'Body Buddy',mark:'BB',related:[30,32,13,25],joke:'안드로이드와 긴급 의료팩이 함께 나오는 복지. 입사 첫날 지급품 목록부터 정독하게 될 듯하다.',rumors:['샤오 린 메이의 수상한 실험설']},
 {slug:'obox',alias:'OBOX',mark:'OB',related:[30,33,6],joke:'11층 20% 확보 뒤 방어태세. 더 내려가기 전에, 일단 지금 확보한 곳부터 지키자는 분위기.',rumors:[]}
];
export function companyProfiles(articles){
 const byId=id=>articles.find(a=>a.id===id);
 const business=byId(30).blocks.find(b=>b.type==='table').rows.slice(1);
 const cultures=byId(32).blocks.find(b=>b.type==='table').rows.slice(1);
 return companySpecs.map(spec=>{const row=business.find(r=>r[0].startsWith(spec.alias));const culture=cultures.find(r=>r[0].startsWith(spec.alias+' /'));
 return {...spec,name:row[0],business:row[1],leader:culture?culture[0].split(' / ')[1]:'공개 기록에 명시되지 않음',culture:culture?.[1]||'공개 기록에 명시되지 않음'};});
}
