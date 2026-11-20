'use strict';
const embeddedImages={"coast": "assets/bien-cua-viet.webp", "harbor": "assets/cang-cua-viet.webp", "boats": "assets/tu-lieu-22.webp", "fishing": "assets/cua-song-thach-han.webp"};
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const two = n => String(n).padStart(2, '0');
const routes = {1:{title:'Dấu ấn lịch sử',short:'LỊCH SỬ',color:'#a65b43'},2:{title:'Ký ức sống',short:'KÝ ỨC SỐNG',color:'#55754c'},3:{title:'Cửa Việt hôm nay',short:'CỬA VIỆT HÔM NAY',color:'#287e87'}};
const intro = 'Chào bạn đến với Chạm Cửa Việt. Có những vùng đất ta nhớ bằng một tấm ảnh. Có những vùng đất ta hiểu hơn qua một câu chuyện. Cửa Việt trong hành trình này là cửa biển, là ký ức lịch sử, là nhịp sống của những con người gắn bó với biển. Bạn có thể bắt đầu từ một bức ảnh, thử trả lời một câu hỏi, rồi viết lại điều khiến mình suy nghĩ. Năm điểm chạm không chỉ là năm lần dừng lại. Đó là năm cơ hội để quan sát kỹ hơn, hỏi nhiều hơn và trân trọng những điều bình dị quanh mình. Hãy chọn một điểm chạm. Câu chuyện tiếp theo đang chờ bạn.';
const sourceUrls = {
 coast:'https://nongnghiepmoitruong.vn/ve-cua-viet-giup-cac-runner-trai-nghiem-bien-xanh-cat-trang-nang-vang-i383664.html',
 fishing:'https://xanhx.vn/media/mot-som-mai-hoi-ha-o-cang-ca-lon-nhat-quang-tri-10719.html',
 boats:'https://vov.vn/tin-24h/ngu-dan-quang-tri-lo-lang-vi-cat-boi-lap-cua-bien-cua-viet-764467.vov',
 harbor:'https://baodautu.vn/quang-tri-co-them-3-cang-bien-duoc-ap-dung-thi-thuc-dien-tu-e-visa-d451059.html'
};
const points = [{"id": 1, "route": 1, "title": "Cửa Việt – cửa biển của ký ức", "image": "harbor", "x": 34, "y": 16, "desc": "Không gian Cửa Việt xưa và nay. Bắt đầu từ nơi dòng sông gặp biển.", "text": ["Cửa Việt là vùng cửa biển nằm ở phía Đông tỉnh Quảng Trị, nơi sông Thạch Hãn đổ ra biển Đông. Sự giao thoa giữa dòng sông và biển đã tạo nên một không gian địa lí đặc trưng, gắn liền với hoạt động giao thông đường thủy, khai thác thủy sản và sinh sống của cộng đồng cư dân ven biển.", "Trải qua thời gian, Cửa Việt từng bước trở thành địa bàn có vai trò quan trọng về kinh tế, giao thông và quốc phòng. Cảng Cửa Việt là đầu mối giao thông đường biển, góp phần kết nối hoạt động vận chuyển hàng hóa và phát triển kinh tế biển của địa phương. Trong những năm tháng chiến tranh, vị trí cửa biển và cảng Cửa Việt còn mang ý nghĩa chiến lược, gắn với nhiều sự kiện lịch sử của Quảng Trị. Ngày nay, Cửa Việt tiếp tục đổi thay với hoạt động cảng biển, nghề cá, dịch vụ và du lịch. Những giá trị tự nhiên, lịch sử và đời sống cộng đồng đã tạo nên bản sắc riêng của vùng đất cửa biển này.", "Cửa ngõ giao thương: Trước thế kỷ XVI, khu vực Cửa Việt nằm ở vùng tiếp giáp hoặc biên giới giữa Đại Việt và vương국 Champa.", "Điểm kết nối hàng hải: Nơi đây sớm là một điểm dừng chân, giao thương hàng hải quan trọng, kết nối các tuyến đường thủy giữa miền Bắc, miền Trung Việt Nam và các nước Đông Nam Á. ", "Khởi nguồn từ cuộc Nam tiến: Năm 1558, Đoan Quốc công Nguyễn Hoàng vào trấn thủ vùng Thuận Hóa, theo đường thủy đi qua Cửa Việt để ngược dòng lên đóng dinh đầu tiên tại Ái Tử (Triệu Phong). ", "Thương cảng sầm uất: Dưới thời các chúa Nguyễn và triều Nguyễn, Cửa Việt (từng mang tên Phó Hội từ đầu thế kỷ XIX) trở thành một bến thuyền, thương điếm và cảng biển tấp nập thuyền buôn trong và ngoài nước. ", "Căn cứ ven biển: Trong cuộc kháng chiến chống thực dân Pháp, Cửa Việt tiếp tục giữ vai trò là một cửa ngõ giao thông đường thủy và địa bàn chiến lược ở chiến trường Bình-Trị-Thiên.", "Tọa độ lửa và căn cứ quân sự: Nằm gần khu phi quân sự (DMZ) vĩ tuyến 17, Cửa Việt trở thành một quân cảng và đầu mối tiếp vận trọng yếu của Mỹ và quân đội Việt Nam Cộng hòa, đồng thời là mục tiêu tấn công táo bạo của lực lượng đặc công và quân giải phóng (nổi bật là các trận đánh gây thiệt hại lớn cho tàu dầu và căn cứ đối phương). ", "Địa chỉ đỏ lịch sử: Cảng Cửa Việt cùng với Tượng đài Chiến thắng Cửa Việt trở thành biểu tượng lịch sử, giáo dục truyền thống cách mạng cho thế hệ hôm nay"], "prompt": "Điều gì khiến em ấn tượng nhất về cảnh quan và những đổi thay của Cửa Việt? Bạn mong muốn gìn giữ điều gì?", "q": "“Cửa biển” được hiểu là không gian nào?", "options": ["Nơi dòng sông gặp biển", "Một hồ nước nằm trên núi", "Một tuyến đường trong đô thị"], "correct": 0, "explain": "Cửa biển là nơi dòng sông thông ra biển. Không gian ấy giúp ta kết nối câu chuyện địa lý với lịch sử và đời sống.", "opening": ["Cửa Việt nằm ở phía Đông tỉnh Quảng Trị, nơi sông Thạch Hãn đổ ra biển Đông. Đây là không gian giao thoa giữa sông, biển và đất liền, tạo nên những đặc điểm tự nhiên và điều kiện thuận lợi cho hoạt động giao thông đường thủy, khai thác thủy sản và giao thương.", "Nổi bật trong không gian ấy là cảng Cửa Việt – một đầu mối giao thông đường biển có vai trò quan trọng đối với hoạt động vận chuyển hàng hóa, phát triển kinh tế biển và kết nối vùng. Không chỉ mang giá trị về địa lí và kinh tế, Cửa Việt còn là vùng đất lưu giữ nhiều dấu ấn lịch sử, văn hóa và ký ức của các thế hệ cư dân địa phương."]}, {"id": 2, "route": 1, "title": "Dấu ấn lịch sử Cửa Việt", "image": "coast", "x": 60, "y": 33, "desc": "Một vùng đất, những dấu mốc lịch sử. Đọc tư liệu để hiểu và trân trọng hòa bình.", "text": ["Trong cuộc kháng chiến chống Mỹ, cảng Cửa Việt là đầu mối giao thông đường thủy quan trọng ở Quảng Trị. Với vị trí kết nối đường biển và khu vực nội địa, cảng có ý nghĩa về quân sự, vận chuyển và hậu cần. Vì vậy, khu vực này trở thành địa bàn tranh chấp quyết liệt giữa các lực lượng tham chiến.", "Cuối tháng 1/1973, trong bối cảnh Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết ngày 27/1/1973, quân đội Việt Nam Cộng hòa mở cuộc hành quân mang tên “Tango City” nhằm tái chiếm cảng Cửa Việt.", "Cuộc chiến đấu diễn ra quyết liệt từ ngày 25 đến ngày 31/1/1973. Trước tình hình đó, lực lượng Quân Giải phóng tổ chức phòng ngự, củng cố lực lượng và triển khai phản đột kích.", "Ngày 31/1/1973, lực lượng Quân Giải phóng mở đợt phản đột kích, đánh vào các cụm quân đối phương ở khu vực phía Nam cảng Cửa Việt. Sau những trận chiến đấu quyết liệt, cuộc hành quân “Tango City” bị đánh bại, khu vực cảng Cửa Việt được giữ vững.", "Trận Cửa Việt tháng 1/1973 là một sự kiện quan trọng trong lịch sử đấu tranh của quân và dân Quảng Trị. Chiến thắng góp phần giữ vững vùng giải phóng, bảo vệ địa bàn có ý nghĩa chiến lược và để lại dấu ấn sâu sắc trong lịch sử địa phương.", "Sự kiện cũng nhắc nhở thế hệ hôm nay về tinh thần chiến đấu kiên cường, lòng yêu nước và sự hy sinh của các thế hệ đi trước."], "prompt": "Điều gì khiến em ấn tượng về trận Cửa Việt tháng 1/1973? Viết một lời tri ân và một việc bạn có thể làm để gìn giữ ký ức quê hương.", "q": "Để kiểm chứng một chi tiết lịch sử, cách nào phù hợp nhất?", "options": ["Chỉ dựa vào một ảnh phong cảnh hiện tại", "Đối chiếu các nguồn tư liệu có xuất xứ rõ ràng", "Chọn câu chuyện được chia sẻ nhiều nhất"], "correct": 1, "explain": "Nguồn rõ ràng và việc đối chiếu tư liệu giúp ta tìm hiểu lịch sử cẩn trọng, tôn trọng tính chân thực.", "opening": ["Cửa Việt là vùng cửa biển nằm ở phía Đông tỉnh Quảng Trị, gắn với cửa sông Thạch Hãn và vùng biển ven bờ. Không chỉ có ý nghĩa về giao thông và kinh tế, khu vực này còn giữ vị trí quan trọng về quân sự trong những năm tháng chiến tranh.", "Trong cuộc kháng chiến chống Mỹ, cảng Cửa Việt là đầu mối giao thông đường thủy có ý nghĩa chiến lược. Vị trí cửa biển tạo điều kiện kết nối đường biển với vùng nội địa, khiến khu vực này trở thành địa bàn có ý nghĩa quan trọng đối với hoạt động vận chuyển, hậu cần và kiểm soát chiến trường."]}, {"id": 3, "route": 2, "title": "Người kể chuyện Cửa Việt", "image": "fishing", "x": 34, "y": 50, "desc": "Ký ức của nhân chứng và người dân. Lắng nghe để nối những thế hệ.", "text": ["Ký ức của một vùng đất có thể được gìn giữ trong gia đình, nhà trường, tư liệu và câu chuyện của những người từng sống ở đó. Lắng nghe người đi trước là một cách để đặt những sự kiện vào trải nghiệm con người.", "Nếu thực hiện phỏng vấn, hãy xin phép trước khi ghi âm, ghi rõ thời điểm và bối cảnh câu chuyện, tôn trọng quyền không trả lời. Lời kể cá nhân có giá trị riêng và cần được đối chiếu khi dùng để xác nhận một chi tiết lịch sử."], "prompt": "Hãy viết một câu hỏi mở mà bạn muốn hỏi người lớn tuổi về Cửa Việt.", "q": "Trước khi ghi âm câu chuyện của một người, bạn cần làm gì?", "options": ["Ghi âm ngay để không bỏ lỡ", "Đăng thông tin của họ trước", "Xin phép và giải thích mục đích sử dụng"], "correct": 2, "explain": "Xin phép, nói rõ mục đích và tôn trọng lựa chọn của người kể là bước đầu để lưu giữ ký ức có trách nhiệm."}, {"id": 4, "route": 2, "title": "Nhịp sống làng biển", "image": "boats", "x": 60, "y": 67, "desc": "Nghề biển, sinh kế và đời sống cộng đồng. Khám phá những điều bình dị bên bờ sóng.", "text": ["Tàu thuyền, ngư cụ, bến cá và người lao động là những chi tiết có thể quan sát trong hình ảnh đời sống miền biển. Mỗi công việc cho thấy mối liên hệ giữa con người và môi trường tự nhiên.", "Thay vì chỉ tìm những điều nổi bật, hãy thử quan sát một vật dụng quen thuộc: chiếc lưới được dùng thế nào, thuyền cần chuẩn bị những gì, một chuyến biển có những công việc nào? Những câu hỏi bình dị có thể mở ra câu chuyện văn hóa và tri thức nghề nghiệp.", "Phóng sự của XANH EWEC ghi lại cảnh cảng cá Cửa Việt bắt đầu hoạt động từ khoảng 4 giờ sáng. Thuyền cập bến, cá được chuyển lên bờ và những người buôn bán bắt đầu công việc.", "Một bức ảnh chợ cá có thể được đọc theo nhiều lớp: ai đang làm việc, họ phối hợp ra sao, sản phẩm đi tiếp đến đâu? Đằng sau một mẻ cá là sự tham gia của nhiều người và những công việc nối tiếp nhau.", "Nhìn vào ảnh khu vực cảng Cửa Việt hôm nay, bạn có thể thấy tàu, mặt nước và các công trình phục vụ hoạt động cảng. Những yếu tố ấy gợi ra câu chuyện về vận chuyển, lao động và kết nối."], "prompt": "Một vật dụng nào trong ảnh khiến bạn muốn nghe người dân giải thích thêm?", "q": "Cách nào giúp bạn hiểu hơn về đời sống làng biển?", "options": ["Quan sát công việc và hỏi người dân với thái độ tôn trọng", "Chỉ chụp ảnh rồi bỏ qua câu chuyện", "Tự suy đoán mọi tập quán từ một tấm ảnh"], "correct": 0, "explain": "Quan sát và đặt câu hỏi tôn trọng giúp bạn hiểu đời sống từ chính những người đang thực hành nó."}, {"id": 5, "route": 3, "title": "Cửa Việt trong mắt người trẻ", "image": "coast", "x": 34, "y": 84, "desc": "Học sinh nhìn nhận và kể lại địa phương. Biến điều đã học thành một sản phẩm của riêng mình.", "text": ["Điều bạn nhớ sau hành trình có thể là đường bờ biển, công việc của ngư dân hoặc một câu hỏi về quá khứ. Viết lại cảm nhận giúp bạn nhận ra điều gì thật sự khiến mình quan tâm.", "Hãy tách hai phần khi viết: điều bạn đã quan sát hoặc đọc được và điều bạn cảm thấy hoặc muốn tìm hiểu tiếp. Bạn có thể chia sẻ sản phẩm học tập với giáo viên; trên trang này, ghi chép được lưu riêng trong trình duyệt của bạn.", "Ảnh Cửa Việt nhìn từ trên cao cho thấy đường bờ cát, những lớp sóng và sự thay đổi màu nước. Một góc nhìn rộng giúp ta nhận ra mối liên hệ giữa bờ và biển, thay vì chỉ tập trung vào một chi tiết.", "Khi đến một không gian biển, chúng ta có thể bắt đầu từ những việc nhỏ: giữ rác của mình, tôn trọng cảnh quan và tuân theo hướng dẫn an toàn tại địa phương. Yêu một nơi cũng là quan tâm đến cách mình hiện diện ở đó."], "prompt": "Viết một điều đã học, một cảm nhận và một câu hỏi bạn muốn tiếp tục khám phá.", "q": "Một ghi chép học tập rõ ràng nên có đặc điểm nào?", "options": ["Gọi mọi cảm nhận cá nhân là sự thật đã kiểm chứng", "Phân biệt điều quan sát được với cảm nhận, câu hỏi riêng", "Chép lại thông tin mà không quan tâm nguồn"], "correct": 1, "explain": "Phân biệt quan sát, nguồn thông tin và cảm nhận giúp ghi chép rõ ràng, đồng thời tạo hướng tìm hiểu tiếp."}];
const steps=['Bạn đang ở đâu?','Thử đoán xem','Chạm qua hình ảnh','Lắng nghe Cửa Việt','Khám phá','Bạn nhớ gì?','Ký ức của bạn','Chọn đường đi tiếp'];
const storageKey='cham_cua_viet_5cham_v1';
let state={stamps:{},notes:{}};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object'){if(saved.stamps&&typeof saved.stamps==='object')for(const p of points)if(saved.stamps[p.id]===true)state.stamps[p.id]=true;if(saved.notes&&typeof saved.notes==='object')for(const p of points){const n=saved.notes[p.id];if(n&&typeof n.text==='string')state.notes[p.id]={text:n.text.slice(0,800),at:typeof n.at==='string'?n.at:''};}}}catch{}
let filterRoute=0,searchQuery='',selectedPoint=1,currentPoint=1,currentStep=0,speaking=false,toastTimer;
let mapFocusTimer=null,mapReturnId=null,mapFocusOwnerOpen=false;
const quizResponses={guess:{},memory:{}};
const experience=$('#experience-dialog'), utility=$('#utility-dialog');
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));return true;}catch{toast('Trình duyệt không cho lưu. Bạn có thể tải nhật ký để giữ tiến trình.');return false;}}
function toast(text){clearTimeout(toastTimer);const el=$('#toast');el.textContent=text;el.classList.add('visible');toastTimer=setTimeout(()=>el.classList.remove('visible'),4000);}
function normalize(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d');}
function filteredPoints(){const query=normalize(searchQuery);return points.filter(p=>(!filterRoute||p.route===filterRoute)&&normalize(p.title+' '+p.desc+' '+routes[p.route].title).includes(query));}
function refresh(){renderPins();renderGrid();renderProgress();}
function renderPins(){const ids=filteredPoints().map(p=>p.id);$('#map-pins').innerHTML=points.map(p=>`<button class="map-pin ${p.id===selectedPoint?'active':''} ${ids.includes(p.id)?'':'filtered'} ${state.stamps[p.id]?'stamped':''}" style="left:${p.x}%;top:${p.y}%;--pin-color:${routes[p.route].color}" data-action="select" data-id="${p.id}" aria-haspopup="dialog" aria-controls="experience-dialog" aria-label="Chạm ${two(p.id)}: ${p.title}${state.stamps[p.id]?', đã có dấu':''}" aria-pressed="${p.id===selectedPoint}" ${ids.includes(p.id)?'':'disabled'}><img class="stop-photo" src="${embeddedImages[p.image]}" alt=""><div class="stop-copy"><small>CHẠM ${two(p.id)} <span class="stop-category">· ${routes[p.route].short}</span></small><strong>${p.title}</strong><em>${['Nơi dòng sông gặp biển','Tư liệu và các mốc năm 1973','Lời kể của người dân','Nghề biển, lễ hội và ẩm thực','Góc nhìn và ý tưởng của bạn'][p.id-1]}</em></div><b class="stop-arrow">${icon('arrow')}</b></button>`).join('');$$('.route-line').forEach(p=>p.style.opacity=!filterRoute||Number(p.dataset.path)===filterRoute?'1':'.12');}
function renderGrid(){const list=filteredPoints();$('#point-grid').innerHTML=list.map(p=>`<button class="point-card" data-action="open-point" data-id="${p.id}" aria-label="Mở chạm ${two(p.id)}: ${p.title}"><div class="point-card-image"><img src="${embeddedImages[p.image]}" alt="" loading="lazy"><span class="point-number">${two(p.id)}</span>${state.stamps[p.id]?'<span class="point-stamp">✓ Đã chạm</span>':''}</div><p class="micro"><i class="dot" style="background:${routes[p.route].color}"></i>${routes[p.route].short}</p><h3>${p.title}</h3><div class="point-card-footer"><span>8 bước trải nghiệm</span>${icon('arrow')}</div></button>`).join('');$('#results-count').textContent=`Hiển thị ${list.length} / 5 điểm chạm`;$('#empty-results').hidden=list.length>0;}
function renderProgress(){const count=points.filter(p=>state.stamps[p.id]).length;$$('.passport-count').forEach(e=>e.textContent=count+'/5');$('#passport-progress').textContent=count+' / 5';$('#mini-stamps').innerHTML=points.map(p=>`<span class="mini-stamp ${state.stamps[p.id]?'done':''}" title="${p.title}: ${state.stamps[p.id]?'đã hoàn thành':'chưa hoàn thành'}">${state.stamps[p.id]?icon('check'):two(p.id)}</span>`).join('');}
function applyFilter(route,resetSearch=false){resetMapFocus();filterRoute=route;if(resetSearch){searchQuery='';$('#point-search').value='';}const list=filteredPoints();if(!list.some(p=>p.id===selectedPoint))selectedPoint=list[0]?.id||0;$$('[data-action="filter"]').forEach(b=>{const active=Number(b.dataset.route)===route;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});refresh();}
function stopNarration(){if('speechSynthesis'in window)window.speechSynthesis.cancel();speaking=false;$$('[data-action="narrate"]').forEach(b=>{b.innerHTML=icon('play');b.setAttribute('aria-label','Nghe thuyết minh tự động');b.closest('.audio-card')?.classList.remove('playing');});$$('.audio-indicator').forEach(e=>e.textContent='Sẵn sàng');}
function narrate(context){if(speaking){stopNarration();return;}if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){toast('Thiết bị chưa hỗ trợ giọng đọc. Bạn vẫn có thể đọc toàn bộ nội dung.');return;}const text=context==='intro'?intro:points.find(p=>p.id===Number(context))?.text.join(' ');if(!text)return;const utter=new SpeechSynthesisUtterance(text);utter.lang='vi-VN';utter.rate=.91;const vi=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('vi'));if(vi)utter.voice=vi;utter.onend=()=>stopNarration();utter.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')toast('Giọng đọc chưa sẵn sàng trên thiết bị. Hãy đọc nội dung bên dưới.');stopNarration();};speaking=true;$$(`[data-action="narrate"][data-context="${context}"]`).forEach(b=>{b.innerHTML=icon('stop');b.setAttribute('aria-label','Dừng thuyết minh');b.closest('.audio-card')?.classList.add('playing');});$$('.audio-indicator').forEach(e=>e.textContent='Đang đọc');window.speechSynthesis.speak(utter);}
function waveMarkup(){return Array.from({length:40},(_,i)=>`<i style="--h:${3+(i*7%14)}px;--d:${i*.07}s"></i>`).join('');}
$$('.waveform').forEach(e=>e.innerHTML=waveMarkup());
function showDialog(dialog){if(!dialog.open)dialog.showModal();document.body.classList.add('dialog-open');}
function closeDialog(dialog){stopNarration();dialog.close();if(dialog===experience)resetMapFocus(true);if(!$$('dialog[open]').length)document.body.classList.remove('dialog-open');}
function showUtility(title,html){stopNarration();$('#utility-content').innerHTML=`<h2 id="utility-title">${title}</h2>${html}`;showDialog(utility);utility.scrollTop=0;}
function openPoint(id){const p=points.find(p=>p.id===id);if(!p)return;if(utility.open)utility.close();stopNarration();clearTimeout(mapFocusTimer);mapFocusTimer=null;currentPoint=id;currentStep=0;selectedPoint=id;renderPins();renderExperience();showDialog(experience);experience.scrollTop=0;}
function resetMapFocus(restoreFocus=false){
 clearTimeout(mapFocusTimer);mapFocusTimer=null;
 const canvas=$('.map-canvas'),scene=$('#map-scene'),returnId=mapReturnId;
 mapReturnId=null;mapFocusOwnerOpen=false;
 scene.style.transition='none';
 canvas.classList.remove('is-zooming','is-focused');canvas.setAttribute('aria-busy','false');
 scene.style.removeProperty('--map-x');scene.style.removeProperty('--map-y');scene.style.removeProperty('--map-zoom');
 scene.getBoundingClientRect();scene.style.removeProperty('transition');
 $('#map-open-status').textContent='Chọn một chạm để mở câu chuyện';
 if(restoreFocus&&returnId&&!$$('dialog[open]').length)$(`.map-pin[data-id="${returnId}"]`)?.focus({preventScroll:true});
}
function zoomToPoint(id){if(!filteredPoints().some(p=>p.id===id))return;selectedPoint=id;openPoint(id);}
function renderExperience(focus=false){const p=points.find(p=>p.id===currentPoint);$('#experience-content').innerHTML=`<div class="experience-head" data-point="${p.id}"><img src="${embeddedImages[p.image]}" alt="Ảnh Cửa Việt hiện tại minh họa chủ đề"><p class="eyebrow">CHẠM ${two(p.id)} · TUYẾN ${two(p.route)} · ${routes[p.route].short}</p><h2 id="experience-title">${p.title}</h2><button class="icon-btn" data-action="close" aria-label="Đóng điểm chạm">${icon('close')}</button></div><div class="experience-layout"><div class="step-nav" role="tablist" aria-label="Các bước trải nghiệm" aria-orientation="${window.matchMedia('(max-width:650px)').matches?'horizontal':'vertical'}">${steps.map((s,i)=>`<button class="step-tab ${i===currentStep?'active':''}" id="step-tab-${i}" role="tab" aria-selected="${i===currentStep}" aria-controls="step-panel" tabindex="${i===currentStep?0:-1}" data-action="step" data-step="${i}"><span>${two(i+1)}</span>${s}</button>`).join('')}</div><div class="step-content" id="step-panel" role="tabpanel" aria-labelledby="step-tab-${currentStep}" tabindex="0"><p class="eyebrow">BƯỚC ${two(currentStep+1)} / 08</p>${stepMarkup(p)}<div class="step-footer"><span>${state.stamps[p.id]?'✓ Đã nhận dấu ký ức':'Khám phá theo nhịp của bạn'}</span><div>${currentStep>0?'<button class="btn btn-outline" data-action="step" data-step="'+(currentStep-1)+'">Quay lại</button>':''}${currentStep<7?'<button class="btn btn-primary" data-action="step" data-step="'+(currentStep+1)+'">Tiếp theo '+icon('arrow')+'</button>':'<button class="btn btn-primary" data-action="passport">Hộ chiếu '+icon('book')+'</button>'}</div></div></div></div>`;if(focus){$('#step-panel').focus({preventScroll:true});if(window.matchMedia('(max-width:650px)').matches)$('.step-tab.active').scrollIntoView({block:'nearest',inline:'center'});}}
function quizMarkup(p,kind){const previous=quizResponses[kind][p.id];return `<h3>${kind==='guess'?'Bạn thử đoán xem?':'Bạn còn nhớ điều gì?'}</h3><p>${p.q}</p><div class="quiz-options">${p.options.map((o,i)=>`<button class="quiz-option ${previous===i?(i===p.correct?'correct':'incorrect'):''}" data-action="answer" data-id="${p.id}" data-answer="${i}" data-kind="${kind}"><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('')}</div><div id="quiz-feedback" aria-live="polite">${previous!==undefined?feedbackMarkup(p,previous,kind):''}</div>${kind==='memory'?'<div class="info-box"><p>Trả lời đúng câu hỏi này để nhận dấu trong hộ chiếu. Bạn có thể quay lại phần Khám phá bất cứ lúc nào.</p></div>':''}`;}
function feedbackMarkup(p,answer,kind){if(answer===p.correct)return `<div class="feedback">${icon('check')} Chính xác. ${p.explain}${kind==='memory'?'<br><strong>Bạn đã nhận dấu CHẠM '+two(p.id)+' trong hộ chiếu.</strong>':''}</div>`;return '<div class="feedback wrong">Chưa đúng rồi. Hãy xem lại phần Khám phá hoặc thử một đáp án khác. Mỗi lần thử là một lần tìm hiểu.</div>';}
function stepMarkup(p){switch(currentStep){
case 0:return `<h3>Chào bạn, tại điểm chạm ${two(p.id)}.</h3><p>${p.desc}</p><p>${p.text[0]}</p><div class="info-box"><p>${icon('compass')} Đây là điểm khám phá theo chủ đề. Sơ đồ không xác nhận bạn đang ở một vị trí thực địa.</p></div><a class="source-link" href="https://www.google.com/maps/search/?api=1&query=C%E1%BB%ADa+Vi%E1%BB%87t+Qu%E1%BA%A3ng+Tr%E1%BB%8B" target="_blank" rel="noopener noreferrer">Xem khu vực Cửa Việt trên Google Maps ${icon('external')}</a>`;
case 1:return quizMarkup(p,'guess');
case 2:return `<h3>Cùng một vùng đất, hai góc nhìn.</h3><p>Kéo thanh trượt để chuyển giữa cảnh quan biển và nhịp sống cảng cá. Bạn nhận ra điều gì khi đổi góc quan sát?</p><div class="compare-wrap"><img src="assets/cua-song-thach-han.webp" alt="Đời sống buổi sớm tại cảng cá Cửa Việt"><div class="compare-top"><img src="assets/bien-cua-viet.webp" alt="Biển Cửa Việt nhìn từ trên cao"></div><span class="compare-label">CẢNH QUAN BIỂN</span><span class="compare-label right">NHỊP SỐNG CẢNG CÁ</span><span class="compare-handle"></span><input id="compare-range" type="range" min="0" max="100" value="50" aria-label="Kéo để so sánh hai góc nhìn Cửa Việt" aria-valuetext="50 phần trăm cảnh quan biển"></div><div class="compare-help"><label for="compare-range">Kéo sang trái / phải · Dùng phím mũi tên</label><span id="compare-value">50%</span></div><div class="info-box"><p>Cả hai là ảnh hiện tại từ các bài báo, không phải cặp ảnh Xưa – Nay cùng vị trí. Nguồn: Báo Nông nghiệp và Môi trường; XANH EWEC.</p></div>`;
case 3:return `<h3>Xem video tư liệu và lời kể.</h3><div class="narration-box"><p>Chọn video về Cửa Việt hoặc phỏng vấn nhân chứng để xem ngay tại đây.</p><label class="listen-field">Chọn video<input type="file" id="interview-file" accept="video/*"></label><div id="interview-player"></div><p class="source-note">Video chỉ phát trên thiết bị này, không được tải lên. Hãy sử dụng tư liệu đã được người xuất hiện trong video đồng ý cho sử dụng.</p></div>`;
case 4:return `<h3>Mỗi chi tiết, một điều để hỏi.</h3><div class="read-copy">${p.text.map(t=>`<p>${t}</p>`).join('')}</div><div class="read-prompt"><strong>Dừng lại một chút:</strong> ${p.prompt}</div><a class="source-link" href="${sourceUrls[p.id===1?'harbor':'coast']}" target="_blank" rel="noopener noreferrer">Xem bài báo nguồn ảnh ${icon('external')}</a><p class="source-note">Ảnh minh họa hiện tại; nội dung học tập biên soạn theo định hướng đề cương. Các điểm chạm 02–04 hướng đến quan sát và đọc tư liệu, không cung cấp niên biểu lịch sử đã thẩm định.</p>`;
case 5:return quizMarkup(p,'memory');
case 6:{const note=state.notes[p.id];return `<h3>Điều gì ở lại trong bạn?</h3><p>${p.prompt}</p><form class="note-form" id="note-form"><label for="memory-note">Cảm nhận của bạn</label><textarea id="memory-note" name="note" rows="4" minlength="3" maxlength="800" required placeholder="Một điều đã học, một cảm nhận, một câu hỏi…">${esc(note?.text||'')}</textarea><small><span id="note-length">${note?.text.length||0}</span>/800 ký tự · Chỉ lưu trên trình duyệt này</small><button class="btn btn-primary" type="submit">${icon('heart')} Lưu cảm nhận của tôi</button></form><div id="note-feedback" role="status">${note?'<div class="note-saved">Cảm nhận đã được lưu. Bạn có thể chỉnh sửa và lưu lại.</div>':''}</div>`;}
case 7:{const next=points.filter(x=>x.id!==p.id).sort((a,b)=>(a.route===p.route?0:1)-(b.route===p.route?0:1)||a.id-b.id).slice(0,3);return `<h3>Câu chuyện tiếp theo là gì?</h3><p>${state.stamps[p.id]?'Bạn đã mang theo một dấu ký ức mới.':'Bạn có thể làm câu hỏi Ghi nhớ để nhận dấu, hoặc tiếp tục khám phá theo sở thích.'} Chọn một chủ đề để đi tiếp.</p><div class="next-points">${next.map(n=>`<button class="next-point" data-action="open-point" data-id="${n.id}"><span>${two(n.id)}</span><div><strong>${n.title}</strong><small>${routes[n.route].title}${state.stamps[n.id]?' · Đã nhận dấu':''}</small></div>${icon('arrow')}</button>`).join('')}</div>`;}
}}
function passportMarkup(){const count=points.filter(p=>state.stamps[p.id]).length;const notes=points.filter(p=>state.notes[p.id]);return `<p>Mỗi dấu là một điều bạn đã học. Mỗi dòng cảm nhận là một phần ký ức của riêng bạn.</p><div class="passport-stats"><div><b>${two(count)}<span> / 05 DẤU KÝ ỨC</span></b><div class="progress-track" role="progressbar" aria-label="Số điểm chạm đã hoàn thành" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="5"><div style="width:${count/5*100}%"></div></div></div><span>${count===5?'Hành trình trọn vẹn!':count?'Hành trình đang tiếp nối':'Bắt đầu từ một điểm chạm'}</span></div><div class="passport-stamps">${points.map(p=>`<button class="passport-stamp ${state.stamps[p.id]?'done':''}" data-action="open-point" data-id="${p.id}" aria-label="${p.title}, ${state.stamps[p.id]?'đã nhận dấu':'chưa nhận dấu'}"><span>${state.stamps[p.id]?icon('check'):two(p.id)}</span><small>${p.title}</small></button>`).join('')}</div><div class="info-box"><p>Nhận dấu bằng cách trả lời đúng các câu hỏi ở bước Bạn nhớ gì? của từng điểm chạm. Tiến trình lưu riêng trên trình duyệt này.</p></div><button class="btn btn-primary" data-action="continue">${count===5?'Khám phá lại':'Tiếp tục hành trình'} ${icon('arrow')}</button><button class="btn btn-outline" data-action="download">${icon('download')} Tải nhật ký (.txt)</button><h3>Cảm nhận đã lưu <small>(${notes.length})</small></h3>${notes.length?notes.map(p=>`<div class="journal-item"><strong>CHẠM ${two(p.id)} · ${p.title}</strong><p>${esc(state.notes[p.id].text)}</p><small>${dateLabel(state.notes[p.id].at)}</small></div>`).join(''):'<p>Chưa có ghi chép. Hãy ghé bước Ký ức của bạn trong một điểm chạm để viết điều bạn muốn giữ lại.</p>'}`;}
function dateLabel(date){const d=new Date(date);return Number.isNaN(d.getTime())?'':d.toLocaleString('vi-VN');}
function openPassport(){if(experience.open)experience.close();showUtility('Hộ chiếu ký ức của bạn',passportMarkup());}
function downloadJournal(){const count=points.filter(p=>state.stamps[p.id]).length;let text='CHẠM CỬA VIỆT — NHẬT KÝ HÀNH TRÌNH\n'+new Date().toLocaleString('vi-VN')+'\n\nĐã sưu tập '+count+'/5 dấu ký ức.\n\n';for(const p of points){text+=`CHẠM ${two(p.id)}: ${p.title}\nTuyến: ${routes[p.route].title}\nTrạng thái: ${state.stamps[p.id]?'Đã nhận dấu':'Chưa nhận dấu'}\n`;if(state.notes[p.id])text+='Cảm nhận: '+state.notes[p.id].text+'\nLưu lúc: '+dateLabel(state.notes[p.id].at)+'\n';text+='\n';}text+='Ghi chép cá nhân lưu trên thiết bị, không phải dữ liệu khảo sát đã gửi cho nhà trường.\n';const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Nhat-ky-Cham-Cua-Viet.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Nhật ký đã được chuẩn bị để tải về.');}
function showSources(){showUtility('Tư liệu tạo nên hành trình',`<p>Giao diện là bản trải nghiệm giáo dục theo đề cương “Ký ức Cửa Việt trong mắt thế hệ trẻ” và bản HTML người dùng cung cấp. Các câu hỏi rèn quan sát, đọc thông tin và ý thức gìn giữ di sản.</p><h3>Nội dung giáo viên cung cấp</h3><p>CHẠM 1- HOÀN THIỆN.docx; CHẠM 02-HOÀN THIỆN.docx; CHẠM 03- HOÀN THIỆN.docx; CHẠM 04-HOÀN THIỆN.docx; CHẠM 05- HOÀN THIỆN.docx. Nội dung từng điểm chạm được đối chiếu với 5 tài liệu Word tương ứng. Ảnh trích từ tài liệu giữ chú thích sẵn có; không bổ sung tác giả khi chưa có thông tin.</p><h3>Nguồn ảnh của bản HTML gốc</h3><ul><li><a href="${sourceUrls.coast}" target="_blank" rel="noopener noreferrer">Báo Nông nghiệp và Môi trường — Cửa Việt, biển xanh, cát trắng, nắng vàng (27/04/2024)</a></li><li><a href="${sourceUrls.fishing}" target="_blank" rel="noopener noreferrer">XANH EWEC — Một sớm mai hối hả ở cảng cá lớn nhất Quảng Trị (01/07/2021)</a></li><li><a href="${sourceUrls.boats}" target="_blank" rel="noopener noreferrer">VOV — Ngư dân Quảng Trị và cửa biển Cửa Việt (20/05/2018)</a></li><li><a href="${sourceUrls.harbor}" target="_blank" rel="noopener noreferrer">Báo Đầu tư — Cảng biển tại Quảng Trị (04/12/2025)</a></li></ul><h3>Phạm vi trải nghiệm</h3><p>Năm điểm chạm là năm chủ đề, không xác nhận năm di tích hoặc vị trí GPS. Ảnh minh họa hiện tại không thay cho ảnh tư liệu lịch sử. Chạm 01–02 có ảnh tư liệu năm 1967 và tư liệu chiến sự tháng 1/1973 theo tài liệu Word, cùng ảnh hiện tại; không phải mọi cặp ảnh đều cùng vị trí/góc chụp để so sánh trực tiếp. Chạm 03–05 dùng tư liệu minh họa, hoạt động sưu tầm và câu hỏi theo chủ đề từng tài liệu.</p><p>Video phỏng vấn do nhóm dự án cung cấp được đặt ở bước Nghe người thật kể của mỗi chạm. Tư liệu video về trận Cửa Việt năm 1973 nằm ở bước Khám phá của Chạm 02. Dấu hộ chiếu là tiến trình học tập cá nhân; trang không tự thu dữ liệu nghiên cứu.</p>`);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=Number(b.dataset.id);switch(b.dataset.action){
case'menu':{const menu=$('#mobile-menu');menu.hidden=!menu.hidden;b.setAttribute('aria-expanded',String(!menu.hidden));b.setAttribute('aria-label',menu.hidden?'Mở menu':'Đóng menu');break;}
case'route':applyFilter(Number(b.dataset.route),true);$('#memory-map').scrollIntoView({behavior:'smooth'});break;
case'filter':applyFilter(Number(b.dataset.route));break;
case'reset-filter':applyFilter(0,true);break;
case'select':zoomToPoint(id);break;
case'open-point':openPoint(id);break;
case'step':stopNarration();currentStep=Math.max(0,Math.min(7,Number(b.dataset.step)));renderExperience(true);break;
case'close':closeDialog(b.closest('dialog'));break;
case'passport':openPassport();break;
case'continue':openPoint((points.find(p=>!state.stamps[p.id])||points[0]).id);break;
case'download':downloadJournal();break;
case'narrate':narrate(b.dataset.context);break;
case'answer':{const p=points.find(p=>p.id===id);const a=Number(b.dataset.answer),kind=b.dataset.kind;if(!p||!quizResponses[kind])break;quizResponses[kind][id]=a;if(kind==='memory'&&a===p.correct){const first=!state.stamps[id];state.stamps[id]=true;const ok=persist();refresh();if(first&&ok)toast('Đã nhận dấu CHẠM '+two(id)+' — Hành trình đang tiếp nối!');}$$('.quiz-option').forEach(x=>{x.classList.remove('correct','incorrect');if(x===b)x.classList.add(a===p.correct?'correct':'incorrect');});$('#quiz-feedback').innerHTML=feedbackMarkup(p,a,kind);if(kind==='memory'&&a===p.correct)$('.step-footer>span').textContent='✓ Đã nhận dấu ký ức';break;}
case'intro':showUtility('Một miền biển. Nhiều câu chuyện.',`<img class="intro-dialog-image" src="assets/bien-cua-viet.webp" alt="Biển Cửa Việt nhìn từ trên cao"><p>CHẠM CỬA VIỆT đưa bạn đến gần lịch sử và văn hóa địa phương qua những hoạt động nhỏ: quan sát, thử đoán, lắng nghe và ghi lại cảm nhận.</p><p>Chọn một trong ba tuyến: <strong>Dấu ấn lịch sử, Ký ức sống, Cửa Việt hôm nay</strong>. Năm điểm chạm đều có câu hỏi ghi nhớ để bạn sưu tập dấu trong hộ chiếu.</p><button class="btn btn-primary" data-action="continue">Bắt đầu từ điểm chạm đầu tiên ${icon('arrow')}</button>`);break;
case'transcript':showUtility('Một phút chạm Cửa Việt',`<p>${intro}</p><div class="info-box"><p>Nội dung biên soạn cho trải nghiệm. Giọng đọc tự động của thiết bị, không phải bản ghi nhân chứng.</p></div>`);break;
case'sources':showSources();break;
case'privacy':showUtility('Hành trình này là của bạn',`<p>Dấu hộ chiếu và cảm nhận được lưu bằng bộ nhớ của trình duyệt trên thiết bị đang dùng. Trang không yêu cầu tên, số điện thoại hoặc tài khoản riêng để ghi cảm nhận.</p><p>Ghi chép không tự động gửi cho giáo viên, nhóm nghiên cứu hoặc hiển thị với người khác. Bạn có thể dùng “Tải nhật ký” trong hộ chiếu để giữ một bản riêng. Xóa dữ liệu trình duyệt hoặc chuyển sang thiết bị khác có thể khiến tiến trình không còn.</p><p>Các liên kết bài báo và Google Maps mở trang bên ngoài; dịch vụ đó có chính sách riêng. Trang không yêu cầu quyền truy cập vị trí, micro hoặc camera.</p><p>Phông chữ được đóng gói cùng giao diện, không cần tải từ dịch vụ phông chữ bên ngoài khi sử dụng.</p>`);break;
case'top':window.scrollTo({top:0,behavior:'smooth'});break;
}});
document.addEventListener('input',e=>{if(e.target.id==='point-search'){searchQuery=e.target.value;applyFilter(filterRoute);}if(e.target.id==='compare-range'){const n=e.target.value;$('.compare-top').style.clipPath=`inset(0 ${100-n}% 0 0)`;$('.compare-handle').style.left=n+'%';$('#compare-value').textContent=n+'%';e.target.setAttribute('aria-valuetext',n+' phần trăm ảnh bên trái');}if(e.target.id==='memory-note')$('#note-length').textContent=e.target.value.length;});
document.addEventListener('submit',e=>{if(e.target.id!=='note-form')return;e.preventDefault();const t=$('#memory-note').value.trim();if(t.length<3){toast('Hãy viết ít nhất 3 ký tự để lưu cảm nhận.');$('#memory-note').focus();return;}state.notes[currentPoint]={text:t.slice(0,800),at:new Date().toISOString()};const ok=persist();$('#note-feedback').innerHTML='<div class="note-saved">'+(ok?'Đã lưu cảm nhận của bạn. Bạn có thể xem và tải trong Hộ chiếu.':'Cảm nhận đang được giữ trong phiên này. Hãy tải nhật ký để lưu một bản.')+'</div>';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mapFocusTimer!==null){resetMapFocus(true);return;}const t=e.target.closest('.step-tab');if(!t)return;let n=currentStep;switch(e.key){case'ArrowDown':case'ArrowRight':n=(currentStep+1)%8;break;case'ArrowUp':case'ArrowLeft':n=(currentStep+7)%8;break;case'Home':n=0;break;case'End':n=7;break;default:return;}e.preventDefault();stopNarration();currentStep=n;renderExperience();$('.step-tab.active').focus({preventScroll:true});$('.step-tab.active').scrollIntoView({block:'nearest',inline:'nearest'});});
$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);});d.addEventListener('close',()=>{if(d===experience&&mapFocusOwnerOpen&&!experience.open)resetMapFocus(true);stopNarration();if(!$$('dialog[open]').length)document.body.classList.remove('dialog-open');});});
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-menu').hidden=true;const b=$('[data-action="menu"]');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Mở menu');}));
window.addEventListener('scroll',()=>{$('.to-top').hidden=window.scrollY<650;},{passive:true});
window.addEventListener('pagehide',stopNarration);
const docAssets={"past": "assets/anh-chien-su-1973.webp", "present": "assets/cua-song-thach-han.webp", "monument": "assets/tuong-dai-lich-su.webp", "boatsDoc": "assets/thuyen-thung.webp", "beachDoc": "assets/tu-lieu-31.webp"};
embeddedImages.boats=docAssets.boatsDoc;
embeddedImages.harbor=docAssets.present;
const questionBanks={
  "1": {
    "guess": [
      {
        "q": "Cửa Việt nằm ở phía nào của tỉnh Quảng Trị?",
        "options": [
          "Phía Tây.",
          "Phía Đông.",
          "Phía Bắc.",
          "Phía Nam."
        ],
        "correct": 1,
        "explain": "Phía Đông."
      },
      {
        "q": "Cửa Việt gắn liền với cửa sông nào?",
        "options": [
          "Sông Bến Hải.",
          "Sông Gianh.",
          "Sông Thạch Hãn.",
          "Sông Nhật Lệ."
        ],
        "correct": 2,
        "explain": "Sông Thạch Hãn."
      },
      {
        "q": "Đặc điểm nổi bật của không gian địa lí Cửa Việt là gì?",
        "options": [
          "Vùng núi cao và thung lũng.",
          "Vùng cửa sông ven biển.",
          "Vùng đồng bằng giữa núi.",
          "Vùng hồ và đầm phá."
        ],
        "correct": 1,
        "explain": "Vùng cửa sông ven biển."
      },
      {
        "q": "Hoạt động kinh tế nào gắn bó lâu đời với cư dân Cửa Việt?",
        "options": [
          "Trồng cây công nghiệp.",
          "Khai thác khoáng sản.",
          "Đánh bắt và khai thác thủy sản.",
          "Chăn nuôi gia súc quy mô lớn."
        ],
        "correct": 2,
        "explain": "Đánh bắt và khai thác thủy sản."
      },
      {
        "q": "Cảng Cửa Việt có vai trò nổi bật nào?",
        "options": [
          "Là đầu mối giao thông đường biển và vận chuyển hàng hóa.",
          "Là trung tâm khai thác khoáng sản miền núi.",
          "Là trung tâm sản xuất công nghiệp nặng.",
          "Là khu vực chuyên trồng cây lương thực."
        ],
        "correct": 0,
        "explain": "Là đầu mối giao thông đường biển và vận chuyển hàng hóa."
      }
    ],
    "memory": [
      {
        "q": "Cửa Việt nằm ở phía nào của tỉnh Quảng Trị?",
        "options": [
          "Phía Tây.",
          "Phía Đông.",
          "Phía Bắc.",
          "Phía Nam."
        ],
        "correct": 1,
        "explain": "Phía Đông."
      },
      {
        "q": "Cửa Việt gắn liền với cửa sông nào?",
        "options": [
          "Sông Bến Hải.",
          "Sông Gianh.",
          "Sông Thạch Hãn.",
          "Sông Nhật Lệ."
        ],
        "correct": 2,
        "explain": "Sông Thạch Hãn."
      },
      {
        "q": "Đặc điểm nổi bật của không gian địa lí Cửa Việt là gì?",
        "options": [
          "Vùng núi cao và thung lũng.",
          "Vùng cửa sông ven biển.",
          "Vùng đồng bằng giữa núi.",
          "Vùng hồ và đầm phá."
        ],
        "correct": 1,
        "explain": "Vùng cửa sông ven biển."
      },
      {
        "q": "Cảng Cửa Việt có vai trò gì?",
        "options": [
          "Đầu mối giao thông đường biển và vận chuyển hàng hóa",
          "Trung tâm khai thác khoáng sản",
          "Vùng chuyên trồng cây công nghiệp",
          "Trung tâm chăn nuôi gia súc"
        ],
        "correct": 0,
        "explain": "Cảng kết nối vận tải đường biển, giao thương và kinh tế địa phương."
      },
      {
        "q": "Nhận định nào thể hiện vai trò của Cửa Việt qua thời gian?",
        "options": [
          "Chỉ có ý nghĩa du lịch",
          "Luôn chỉ là một vùng nông nghiệp",
          "Gắn với giao thương, lịch sử đấu tranh và kinh tế biển",
          "Không có sự thay đổi"
        ],
        "correct": 2,
        "explain": "Tài liệu giới thiệu các vai trò giao thương, địa bàn chiến lược và phát triển kinh tế biển qua từng thời kỳ."
      }
    ]
  },
  "2": {
    "guess": [
      {
        "q": "Trong thời kỳ kháng chiến chống Mỹ, cảng Cửa Việt có vai trò nổi bật nào?",
        "options": [
          "Là trung tâm sản xuất nông nghiệp.",
          "Là đầu mối giao thông đường thủy có ý nghĩa chiến lược.",
          "Là trung tâm khai thác khoáng sản.",
          "Là khu vực chuyên phát triển công nghiệp."
        ],
        "correct": 1,
        "explain": "Là đầu mối giao thông đường thủy có ý nghĩa chiến lược."
      },
      {
        "q": "Vì sao khu vực cảng Cửa Việt có ý nghĩa quan trọng về quân sự?",
        "options": [
          "Có vị trí kết nối đường biển với vùng nội địa.",
          "Nằm sâu trong khu vực miền núi.",
          "Có nhiều mỏ khoáng sản.",
          "Có điều kiện phát triển cây công nghiệp."
        ],
        "correct": 0,
        "explain": "Có vị trí kết nối đường biển với vùng nội địa."
      },
      {
        "q": "Trận Cửa Việt tiêu biểu diễn ra vào thời gian nào?",
        "options": [
          "Tháng 1/1968.",
          "Tháng 3/1972.",
          "Tháng 1/1973.",
          "Tháng 4/1975."
        ],
        "correct": 2,
        "explain": "Tháng 1/1973."
      },
      {
        "q": "Cuộc hành quân mang tên “Tango City” của quân đội Việt Nam Cộng hòa nhằm mục đích gì?",
        "options": [
          "Tái chiếm cảng Cửa Việt.",
          "Xây dựng cảng biển mới.",
          "Khai thác tài nguyên biển.",
          "Mở rộng khu dân cư ven biển."
        ],
        "correct": 0,
        "explain": "Tái chiếm cảng Cửa Việt."
      },
      {
        "q": "Việc tìm hiểu lịch sử Cửa Việt có ý nghĩa gì đối với học sinh?",
        "options": [
          "Chỉ ghi nhớ tên các sự kiện.",
          "Hiểu và trân trọng truyền thống quê hương.",
          "Chỉ tìm hiểu về vũ khí chiến tranh.",
          "Không cần quan tâm đến lịch sử địa phương."
        ],
        "correct": 1,
        "explain": "Hiểu và trân trọng truyền thống quê hương."
      }
    ],
    "memory": [
      {
        "q": "Trong thời kỳ kháng chiến chống Mỹ, cảng Cửa Việt có vai trò nào nổi bật?",
        "options": [
          "Là trung tâm sản xuất nông nghiệp.",
          "Là đầu mối giao thông đường thủy có ý nghĩa chiến lược.",
          "Là trung tâm khai thác khoáng sản.",
          "Là vùng chuyên canh cây công nghiệp."
        ],
        "correct": 1,
        "explain": "Theo tài liệu Chạm 02: Là đầu mối giao thông đường thủy có ý nghĩa chiến lược."
      },
      {
        "q": "Cuộc hành quân “Tango City” bắt đầu vào ngày nào?",
        "options": [
          "Ngày 15/1/1973.",
          "Ngày 20/1/1973.",
          "Ngày 25/1/1973.",
          "Ngày 31/1/1973."
        ],
        "correct": 2,
        "explain": "Theo tài liệu Chạm 02: Ngày 25/1/1973."
      },
      {
        "q": "Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết vào ngày nào?",
        "options": [
          "20/7/1954.",
          "27/1/1973.",
          "30/4/1975.",
          "2/9/1945."
        ],
        "correct": 1,
        "explain": "Theo tài liệu Chạm 02: 27/1/1973."
      },
      {
        "q": "Trận Cửa Việt tháng 1/1973 kết thúc vào ngày nào?",
        "options": [
          "Ngày 25/1/1973.",
          "Ngày 27/1/1973.",
          "Ngày 30/1/1973.",
          "Ngày 31/1/1973."
        ],
        "correct": 3,
        "explain": "Theo tài liệu Chạm 02: Ngày 31/1/1973."
      },
      {
        "q": "Việc tìm hiểu chiến thắng Cửa Việt có ý nghĩa gì đối với thế hệ trẻ?",
        "options": [
          "Chỉ ghi nhớ các con số và sự kiện.",
          "Hiểu, trân trọng truyền thống quê hương và có ý thức gìn giữ ký ức lịch sử.",
          "Chỉ tìm hiểu về phương tiện chiến tranh.",
          "Không cần quan tâm đến lịch sử địa phương."
        ],
        "correct": 1,
        "explain": "Theo tài liệu Chạm 02: Hiểu, trân trọng truyền thống quê hương và có ý thức gìn giữ ký ức lịch sử."
      }
    ]
  },
  "3": {
    "guess": [
      {
        "q": "Nguồn tư liệu nào có thể giúp chúng ta hiểu thêm về cuộc sống của người dân Cửa Việt trong quá khứ?",
        "options": [
          "Chỉ có sách giáo khoa.",
          "Lời kể của những người từng sống và gắn bó với địa phương.",
          "Chỉ có bản đồ hiện nay.",
          "Chỉ có những hình ảnh du lịch."
        ],
        "correct": 1,
        "explain": "Lời kể của những người từng sống và gắn bó với địa phương."
      },
      {
        "q": "Ai có thể trở thành người kể chuyện về Cửa Việt?",
        "options": [
          "Chỉ có cựu chiến binh.",
          "Chỉ có người cao tuổi.",
          "Cựu chiến binh, ngư dân, người cao tuổi và những người gắn bó với địa phương.",
          "Chỉ có cán bộ địa phương."
        ],
        "correct": 2,
        "explain": "Cựu chiến binh, ngư dân, người cao tuổi và những người gắn bó với địa phương."
      },
      {
        "q": "Khi phỏng vấn một nhân chứng lịch sử, học sinh cần làm gì?",
        "options": [
          "Tự ý thay đổi nội dung lời kể.",
          "Ghi âm, ghi hình khi chưa được đồng ý.",
          "Lắng nghe, đặt câu hỏi phù hợp và ghi lại trung thực lời kể.",
          "Chỉ ghi những nội dung mình thích."
        ],
        "correct": 2,
        "explain": "Lắng nghe, đặt câu hỏi phù hợp và ghi lại trung thực lời kể."
      },
      {
        "q": "Vì sao cần lưu giữ những câu chuyện của người dân địa phương?",
        "options": [
          "Để giải trí.",
          "Để bảo tồn ký ức, lịch sử và văn hóa cộng đồng.",
          "Để thay thế hoàn toàn sách lịch sử.",
          "Chỉ để đăng tải lên mạng xã hội."
        ],
        "correct": 1,
        "explain": "Để bảo tồn ký ức, lịch sử và văn hóa cộng đồng."
      },
      {
        "q": "Tư liệu nào có thể được số hóa để lưu giữ ký ức địa phương?",
        "options": [
          "Bản ghi âm, video, hình ảnh và câu chuyện được ghi chép.",
          "Chỉ có văn bản.",
          "Chỉ có hình ảnh.",
          "Chỉ có bản đồ."
        ],
        "correct": 0,
        "explain": "Bản ghi âm, video, hình ảnh và câu chuyện được ghi chép."
      }
    ],
    "memory": [
      {
        "q": "Ai có thể trở thành người kể chuyện về Cửa Việt?",
        "options": [
          "Chỉ có những người làm công tác nghiên cứu lịch sử.",
          "Chỉ có cán bộ địa phương.",
          "Những người từng sống, chiến đấu, lao động và gắn bó với Cửa Việt.",
          "Chỉ có học sinh."
        ],
        "correct": 2,
        "explain": "Những người từng sống, chiến đấu, lao động và gắn bó với Cửa Việt."
      },
      {
        "q": "Khi phỏng vấn người dân địa phương, học sinh cần chú ý điều gì?",
        "options": [
          "Ghi lại trung thực nội dung câu chuyện.",
          "Tự ý thay đổi lời kể.",
          "Chỉ ghi những nội dung gây chú ý.",
          "Không cần ghi nguồn tư liệu."
        ],
        "correct": 0,
        "explain": "Ghi lại trung thực nội dung câu chuyện."
      },
      {
        "q": "Những câu chuyện của ngư dân cao tuổi có thể giúp chúng ta tìm hiểu điều gì?",
        "options": [
          "Chỉ về hoạt động du lịch.",
          "Nghề biển, kinh nghiệm đi biển và đời sống cư dân ven biển.",
          "Chỉ về các công trình xây dựng.",
          "Chỉ về hoạt động thương mại."
        ],
        "correct": 1,
        "explain": "Nghề biển, kinh nghiệm đi biển và đời sống cư dân ven biển."
      },
      {
        "q": "Vì sao cần số hóa các câu chuyện của người dân?",
        "options": [
          "Để thay thế hoàn toàn việc gặp gỡ nhân chứng.",
          "Để lưu giữ, bảo quản và chia sẻ ký ức đến nhiều người hơn.",
          "Chỉ để tạo hình ảnh đẹp cho App/Web.",
          "Để không cần kiểm chứng thông tin."
        ],
        "correct": 1,
        "explain": "Để lưu giữ, bảo quản và chia sẻ ký ức đến nhiều người hơn."
      },
      {
        "q": "Việc lắng nghe và lưu giữ ký ức của người dân giúp học sinh điều gì?",
        "options": [
          "Chỉ biết thêm tên các nhân vật.",
          "Hiểu hơn về lịch sử, văn hóa và trân trọng giá trị quê hương.",
          "Không cần tìm hiểu các nguồn tư liệu khác.",
          "Chỉ ghi nhớ những câu chuyện giải trí."
        ],
        "correct": 1,
        "explain": "Hiểu hơn về lịch sử, văn hóa và trân trọng giá trị quê hương."
      }
    ]
  },
  "4": {
    "guess": [
      {
        "q": "Nghề nghiệp truyền thống gắn bó lâu đời với cư dân vùng biển Cửa Việt là gì?",
        "options": [
          "Trồng cây công nghiệp.",
          "Đánh bắt và khai thác thủy sản.",
          "Trồng lúa nước quy mô lớn.",
          "Chăn nuôi gia súc trên núi."
        ],
        "correct": 1,
        "explain": "Đánh bắt và khai thác thủy sản."
      },
      {
        "q": "Lễ hội cầu ngư của cư dân ven biển thường thể hiện mong ước nào?",
        "options": [
          "Mùa màng bội thu.",
          "Mưa thuận gió hòa, biển yên, đánh bắt thuận lợi.",
          "Phát triển công nghiệp.",
          "Mở rộng diện tích đất nông nghiệp."
        ],
        "correct": 1,
        "explain": "Mưa thuận gió hòa, biển yên, đánh bắt thuận lợi."
      },
      {
        "q": "Tri thức dân gian về nghề biển thường được hình thành từ đâu?",
        "options": [
          "Kinh nghiệm thực tế được tích lũy và truyền lại qua nhiều thế hệ.",
          "Chỉ từ sách giáo khoa.",
          "Chỉ từ các thiết bị hiện đại.",
          "Từ những hoạt động vui chơi giải trí."
        ],
        "correct": 0,
        "explain": "Kinh nghiệm thực tế được tích lũy và truyền lại qua nhiều thế hệ."
      },
      {
        "q": "Hoạt động nào góp phần giữ gìn bản sắc văn hóa làng biển?",
        "options": [
          "Không quan tâm đến phong tục truyền thống.",
          "Gìn giữ nghề truyền thống, lễ hội và các giá trị văn hóa địa phương.",
          "Thay thế toàn bộ phong tục cũ.",
          "Chỉ tập trung phát triển du lịch."
        ],
        "correct": 1,
        "explain": "Gìn giữ nghề truyền thống, lễ hội và các giá trị văn hóa địa phương."
      },
      {
        "q": "Học sinh có thể góp phần bảo tồn văn hóa làng biển bằng cách nào?",
        "options": [
          "Tìm hiểu, ghi chép và giới thiệu những nét đẹp văn hóa quê hương.",
          "Không tham gia các hoạt động cộng đồng.",
          "Không quan tâm đến nghề truyền thống.",
          "Chỉ tìm hiểu văn hóa ở những nơi khác."
        ],
        "correct": 0,
        "explain": "Tìm hiểu, ghi chép và giới thiệu những nét đẹp văn hóa quê hương."
      }
    ],
    "memory": [
      {
        "q": "Nghề nghiệp gắn bó lâu đời với cư dân ven biển Cửa Việt là gì?",
        "options": [
          "Khai thác khoáng sản.",
          "Đánh bắt và khai thác thủy sản.",
          "Trồng cây công nghiệp.",
          "Chăn nuôi gia súc trên núi."
        ],
        "correct": 1,
        "explain": "Đánh bắt và khai thác thủy sản."
      },
      {
        "q": "Lễ hội cầu ngư thường thể hiện mong ước nào của cư dân ven biển?",
        "options": [
          "Biển yên, trời thuận, đánh bắt thuận lợi và cuộc sống bình an.",
          "Mở rộng diện tích đất nông nghiệp.",
          "Phát triển các khu công nghiệp.",
          "Tăng diện tích rừng trồng."
        ],
        "correct": 0,
        "explain": "Biển yên, trời thuận, đánh bắt thuận lợi và cuộc sống bình an."
      },
      {
        "q": "Tri thức dân gian về nghề biển chủ yếu được hình thành từ đâu?",
        "options": [
          "Kinh nghiệm thực tế trong lao động và cuộc sống.",
          "Các hoạt động vui chơi.",
          "Những thông tin quảng cáo.",
          "Các trò chơi trên mạng."
        ],
        "correct": 0,
        "explain": "Kinh nghiệm thực tế trong lao động và cuộc sống."
      },
      {
        "q": "Hoạt động nào góp phần gìn giữ văn hóa làng biển?",
        "options": [
          "Bỏ qua các phong tục truyền thống.",
          "Tìm hiểu, ghi chép và tham gia các hoạt động văn hóa phù hợp.",
          "Không quan tâm đến nghề truyền thống.",
          "Chỉ lưu giữ những hình ảnh hiện đại."
        ],
        "correct": 1,
        "explain": "Tìm hiểu, ghi chép và tham gia các hoạt động văn hóa phù hợp."
      },
      {
        "q": "Vì sao cần bảo tồn các giá trị văn hóa làng biển?",
        "options": [
          "Vì đó là những giá trị gắn với bản sắc và đời sống cộng đồng.",
          "Vì chỉ có ý nghĩa đối với người cao tuổi.",
          "Vì có thể thay thế mọi hoạt động kinh tế.",
          "Vì không cần thay đổi trong cuộc sống hiện đại."
        ],
        "correct": 0,
        "explain": "Vì đó là những giá trị gắn với bản sắc và đời sống cộng đồng."
      }
    ]
  },
  "5": {
    "guess": [
      {
        "q": "Theo bạn, điều gì hấp dẫn du khách khi đến Cửa Việt?",
        "options": [
          "Cảnh quan thiên nhiên và bãi biển.",
          "Những câu chuyện lịch sử, văn hóa địa phương.",
          "Ẩm thực và cuộc sống làng biển.",
          "Những trải nghiệm khám phá, chụp ảnh và nghỉ dưỡng.",
          "Tất cả những yếu tố trên."
        ],
        "correct": 4,
        "explain": "Cảnh quan, lịch sử, ẩm thực và những trải nghiệm cùng tạo nên sức hấp dẫn của Cửa Việt."
      }
    ],
    "memory": [
      {
        "q": "Điều gì tạo nên sức hấp dẫn của Cửa Việt đối với du khách?",
        "options": [
          "Chỉ có cảnh quan biển",
          "Cảnh quan, văn hóa, con người và trải nghiệm địa phương",
          "Chỉ có hoạt động đánh bắt thủy sản",
          "Chỉ có các công trình xây dựng"
        ],
        "correct": 1,
        "explain": "Cảnh quan, văn hóa, con người và trải nghiệm địa phương"
      },
      {
        "q": "Hình thức nào giúp người trẻ quảng bá hình ảnh Cửa Việt hiệu quả?",
        "options": [
          "Chụp ảnh, làm video và chia sẻ thông tin có trách nhiệm",
          "Đăng tải thông tin chưa kiểm chứng",
          "Chỉ giới thiệu những nơi đông người",
          "Không cần tìm hiểu địa phương"
        ],
        "correct": 0,
        "explain": "Chụp ảnh, làm video và chia sẻ thông tin có trách nhiệm"
      },
      {
        "q": "Sản phẩm nào thể hiện sự sáng tạo của học sinh trong quảng bá du lịch?",
        "options": [
          "Tranh vẽ, poster, video giới thiệu địa phương",
          "Bài chép nguyên văn trên Internet",
          "Thông tin không có nguồn",
          "Hình ảnh không liên quan"
        ],
        "correct": 0,
        "explain": "Tranh vẽ, poster, video giới thiệu địa phương"
      },
      {
        "q": "Phát triển du lịch bền vững cần gắn với điều gì?",
        "options": [
          "Khai thác tài nguyên không giới hạn",
          "Chỉ quan tâm đến lợi nhuận",
          "Bảo vệ môi trường và gìn giữ bản sắc văn hóa",
          "Tăng lượng rác thải du lịch"
        ],
        "correct": 2,
        "explain": "Bảo vệ môi trường và gìn giữ bản sắc văn hóa"
      },
      {
        "q": "Học sinh có thể đóng góp gì cho quê hương Cửa Việt?",
        "options": [
          "Sáng tạo sản phẩm quảng bá và tham gia bảo vệ môi trường",
          "Thờ ơ với các giá trị địa phương",
          "Chỉ quan tâm đến du lịch ở nơi khác",
          "Không cần tìm hiểu lịch sử quê hương"
        ],
        "correct": 0,
        "explain": "Sáng tạo sản phẩm quảng bá và tham gia bảo vệ môi trường"
      }
    ]
  }
};
const bankAnswers={};
const stationLocations = {
  1: {
    name: 'Cửa sông Thạch Hãn', latitude: 16.90845, longitude: 107.19598,
    description: 'Mốc ở cửa sông, nơi dòng Thạch Hãn đổ ra biển Đông.',
    source: 'https://www.openstreetmap.org/way/479071435'
  },
  2: {
    name: 'Đài Chiến thắng Đặc công Hải quân', latitude: 16.90801, longitude: 107.18477,
    description: 'Đài tưởng niệm nằm trên đường Quốc Phòng, ở bờ Bắc cửa biển Cửa Việt.',
    source: 'https://vn.trip.com/travel-guide/attraction/gio-linh-district/city-142840731?poiType=3'
  },
  3: {
    name: 'Cầu Cửa Việt', latitude: 16.90102, longitude: 107.18511,
    description: 'Mốc ở giữa cầu bắc qua sông Thạch Hãn, giúp bạn định vị không gian của những câu chuyện về Cửa Việt.',
    source: 'https://www.openstreetmap.org/way/479124620'
  },
  4: {
    name: 'Cảng cá Cửa Việt', latitude: 16.89841, longitude: 107.18789,
    description: 'Khu bến cá ở bờ nam cửa sông là một góc quan sát tàu thuyền và nhịp sống nghề biển.',
    source: 'https://www.openstreetmap.org/way/1447758473'
  },
  5: {
    name: 'Bãi biển Cửa Việt', latitude: 16.91299, longitude: 107.18657,
    description: 'Mốc ở dải bờ biển phía bắc cửa sông, gợi ý một góc để ghi lại Cửa Việt hôm nay.',
    source: 'https://dulich.quangtri.gov.vn/vi/baibiencuaviet'
  }
};

function stationLocationMarkup(id) {
  const { name, latitude, longitude, description, source } = stationLocations[id];
  const north = latitude.toFixed(5);
  const east = longitude.toFixed(5);
  const query = encodeURIComponent(`${north},${east}`);
  return `<section class="station-location" aria-labelledby="station-location-title">
    <h4 id="station-location-title">${name}</h4>
    <p>${description}</p>
    <dl class="station-coordinates">
      <div><dt>Vĩ độ</dt><dd>${north}° Bắc</dd></div>
      <div><dt>Kinh độ</dt><dd>${east}° Đông</dd></div>
    </dl>
    <div class="station-location-links">
      <a class="btn btn-outline" href="https://www.google.com/maps/search/?api=1&amp;query=${query}" target="_blank" rel="noopener noreferrer">Mở Google Maps ${icon('external')}</a>
      <a class="station-location-source" href="${source}" target="_blank" rel="noopener noreferrer">Nguồn tọa độ</a>
    </div>
  </section>`;
}

function photoComparison(past, present, wide = false) {
  return `<div class="compare-wrap ${wide ? 'compare-cham-one' : ''}"><img src="${present.src}" alt="${present.alt}"><div class="compare-top"><img src="${past.src}" alt="${past.alt}"></div><span class="compare-label">${past.label}</span><span class="compare-label right">${present.label}</span><span class="compare-handle"></span><input id="compare-range" type="range" min="0" max="100" value="50" aria-label="So sánh ảnh tư liệu và hiện tại"></div><div class="compare-help"><label for="compare-range">Kéo để khám phá hai ảnh</label><span id="compare-value">50%</span></div>`;
}

const baseStepMarkup=stepMarkup;
stepMarkup=function(p){
 if (currentStep === 0 && p.opening) {
  const locationPhoto = p.id === 1 ? `<figure class="station-monument">
    <img src="assets/cham-1-toan-canh-cua-viet.webp" width="1920" height="1079" alt="Cửa sông, hai bờ và tàu thuyền ở Cửa Việt nhìn từ trên cao">
    <figcaption>Toàn cảnh Cửa Việt nhìn từ trên cao.</figcaption>
  </figure>` : '';
  return `<h3>${p.title}</h3>${locationPhoto}${stationLocationMarkup(p.id)}${p.opening.map(t => `<p>${esc(t)}</p>`).join('')}`;
 }
 if(currentStep===1||currentStep===5)return bankMarkup(p,currentStep===1?'guess':'memory');
 if(currentStep===2 && p.id<=2) {
  const past = p.id===1
    ? {src: chamOneOriginal, alt: 'Tàu thuyền tại Cửa Việt năm 1967', label: 'TƯ LIỆU · 1967'}
    : {src: docAssets.past, alt: 'Ảnh tư liệu chiến sự Cửa Việt tháng 1 năm 1973', label: 'TƯ LIỆU · 1973'};
  const present = {
    src: p.id===1 ? chamOneToday : chamTwoToday,
    alt: p.id===1 ? 'Cảng Cửa Việt nhìn từ trên cao' : 'Toàn cảnh Cửa Việt hiện nay · ảnh do bạn cung cấp',
    label: 'CỬA VIỆT HIỆN NAY'
  };
  return `<h3>Kéo để chạm quá khứ.</h3><p>${p.id===1?'Quan sát tàu thuyền trong ảnh tư liệu năm 1967 và cảng Cửa Việt trong ảnh đương đại. Đây là hai địa điểm, góc chụp khác nhau trong khu vực Cửa Việt; không phải ảnh trước – sau của cùng một vị trí.':'Quan sát ảnh chiến sự tại Cửa Việt tháng 1/1973 và ảnh cảng Cửa Việt hiện nay. Hai ảnh ghi lại hai thời điểm khác nhau; hãy chú ý sự thay đổi của tàu thuyền và không gian cảng.'}</p>${photoComparison(past, present, p.id===1)}<p class="source-note">${p.id===1?'Ảnh cảng Cửa Việt: Ngọc Tân / <a href="https://baodautu.vn/quang-tri-co-them-3-cang-bien-duoc-ap-dung-thi-thuc-dien-tu-e-visa-d451059.html" target="_blank" rel="noopener noreferrer">Báo Đầu tư</a> (bài viết tháng 12/2025; không ghi ngày chụp).':'Ảnh chiến sự: xe tăng T-54 và bộ đội cơ động ở Cửa Việt, tháng 1/1973; tư liệu do Báo Dân Việt đăng trong bài “Trận Cửa Việt: Vòng cung Kursk trong Chiến tranh Việt Nam”. Ảnh hiện nay: toàn cảnh Cửa Việt do nhóm dự án cung cấp.'}</p>`;
 }
 let html=baseStepMarkup(p);
 if(p.id===2&&currentStep===3){html=`<h3>Nghe người thật kể</h3><p>Câu chuyện về Cửa Việt qua video tư liệu bạn cung cấp.</p><video controls playsinline preload="metadata" aria-label="Video người thật kể về Cửa Việt" style="display:block;width:100%;max-width:960px;height:auto;margin:14px auto;border-radius:12px;background:#102526"><source src="media/Video_Cham_02_Goc_Nghe_Nguoi_That_Ke.mp4" type="video/mp4">Trình duyệt của bạn không hỗ trợ phát video MP4.</video><p class="source-note">Video do bạn cung cấp.</p>`;}else if(currentStep===3){html+=`<details class="timeline-entry"><summary>Góc nghe người thật kể</summary><p>Chưa có bản ghi nhân chứng đính kèm.</p><label class="listen-field">Chọn tệp âm thanh hoặc video<input type="file" id="interview-file" accept="video/*"></label><div id="interview-player"></div><p class="source-note">Tệp chỉ phát tại thiết bị, không được tải lên; cần chọn lại sau khi đóng trang.</p><h4>Câu hỏi gợi mở</h4><ul><li>Bác nhớ nhất điều gì về Cửa Việt trước đây?</li><li>Đời sống và nghề biển đã thay đổi như thế nào?</li><li>Bác muốn nhắn điều gì với thế hệ trẻ?</li></ul></details>`;}
 if(currentStep===4 && p.id===2){
  const timeline = [
    ['25/01/1973', 'Quân lực Việt Nam Cộng hòa mở cuộc hành quân Tango City để giành lại cảng Cửa Việt, một đầu mối giao thông đường thủy quan trọng ở Quảng Trị.'],
    ['27/01/1973', 'Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết. Trong những ngày đó, giao tranh ở Cửa Việt vẫn tiếp diễn.'],
    ['31/01/1973', 'Quân Giải phóng miền Nam Việt Nam phản công và giành lại quyền kiểm soát cảng Cửa Việt.']
  ];
  html = html.replace(/<p class="source-note">Ảnh minh họa hiện tại[^<]*<\/p>/, '');
  html += `<h3>Dòng thời gian · tháng 1/1973</h3>${timeline.map(([date, description]) =>
    `<details class="timeline-entry"><summary>${date}</summary><p>${description}</p></details>`
  ).join('')}<section class="discovery-video"><h3>Xem video tư liệu: Chiến thuật trong trận chiến Cửa Việt năm 1973</h3><video controls playsinline preload="metadata" aria-label="Video về chiến thuật của Quân đội nhân dân Việt Nam trong trận chiến Cửa Việt năm 1973" style="display:block;width:100%;max-width:900px;height:auto;margin:12px auto;border-radius:12px;background:#102526"><source src="media/Video_Cham_02_Tu_Lieu_Tran_Chien_1973.mp4" type="video/mp4">Trình duyệt của bạn không hỗ trợ phát video MP4.</video><p class="source-note">Video do bạn cung cấp.</p></section>`;
 }
 return html;
};
function bankMarkup(p,kind){const qs=questionBanks[p.id][kind],key=p.id+'-'+kind,answers=bankAnswers[key]||{},done=qs.filter((q,i)=>answers[i]===q.correct).length;return `<h3>${kind==='guess'?'Thử đoán xem':'Bạn nhớ gì?'}</h3><p>${kind==='guess'?'Bắt đầu bằng điều bạn biết. Mỗi câu trả lời sẽ mở thêm một điều để khám phá.':'Hoàn thành các câu hỏi dưới đây để nhận dấu ký ức.'}</p><div class="quiz-score" aria-live="polite">Đã đúng <b>${done}/${qs.length}</b> câu ${done===qs.length?'· Hoàn thành!':''}</div>${qs.map((q,j)=>`<section class="quiz-group"><h4>${j+1}. ${esc(q.q)}</h4><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option ${answers[j]===i?(i===q.correct?'correct':'incorrect'):''}" data-action="bank-answer" data-q="${j}" data-value="${i}" data-kind="${kind}"><span>${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>${answers[j]!==undefined?`<div class="feedback ${answers[j]===q.correct?'':'wrong'}">${answers[j]===q.correct?'Đúng rồi! '+esc(q.explain):'Chưa đúng. Hãy thử lại hoặc đọc phần Khám phá.'}</div>`:''}</section>`).join('')}<button class="btn btn-outline" data-action="quiz-reset" data-kind="${kind}">Làm lại câu hỏi</button>`;}
let mediaUrl;
document.addEventListener('change',e=>{if(e.target.id!=='interview-file')return;const f=e.target.files[0];if(!f)return;if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=URL.createObjectURL(f);if(!f.type.startsWith('video/')){toast('Vui lòng chọn tệp video.');return;}const el=document.createElement('video');el.controls=true;el.playsInline=true;el.src=mediaUrl;el.className='local-player';$('#interview-player').replaceChildren(el);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;
 if(b.dataset.action==='bank-answer'){const kind=b.dataset.kind,key=currentPoint+'-'+kind;const qs=questionBanks[currentPoint][kind];bankAnswers[key]||={};bankAnswers[key][Number(b.dataset.q)]=Number(b.dataset.value);if(kind==='memory'&&qs.every((q,i)=>bankAnswers[key][i]===q.correct)){state.stamps[currentPoint]=true;persist();refresh();toast('Đã nhận dấu CHẠM '+two(currentPoint)+'!');}const pos=experience.scrollTop;renderExperience();experience.scrollTop=pos;}
 if(b.dataset.action==='quiz-reset'){delete bankAnswers[currentPoint+'-'+b.dataset.kind];renderExperience();}
 if(b.dataset.action==='gallery')showUtility('Một khung hình Cửa Việt',`<img class="full-photo" src="${b.dataset.key==='past'?chamOneOriginal:docAssets[b.dataset.key]}" alt="${esc(b.dataset.caption)}"><p>${esc(b.dataset.caption)}</p>`);
 if(b.dataset.action==='project'){openPoint(5);currentStep=6;renderExperience();if(!$('#memory-note').value)$('#memory-note').value=b.dataset.type+'\n\n';$('#memory-note').focus();$('#note-length').textContent=$('#memory-note').value.length;}
});


const stationDocuments={"3": {"1": {"html": "<h3>Người kể chuyện Cửa Việt – Những ký ức được lưu giữ qua nhiều thế hệ</h3><p>Cửa Việt không chỉ được tạo nên bởi dòng sông, cửa biển, những bãi cát và con thuyền ra khơi, mà còn được tạo nên từ cuộc đời, câu chuyện và ký ức của bao thế hệ người dân.</p><p>Đó là ký ức của những người lính từng chiến đấu bảo vệ quê hương; những ngư dân đã gắn bó cả cuộc đời với biển; những người cao tuổi lưu giữ câu chuyện về làng xóm, phong tục và nếp sống của cộng đồng cư dân ven biển.</p><p>Qua lời kể của họ, chúng ta có thể hiểu thêm về một Cửa Việt trong quá khứ, cảm nhận những đổi thay của quê hương và trân trọng những giá trị được truyền lại từ thế hệ này sang thế hệ khác.</p>", "photos": [], "extra": []}, "2": {"html": "<p>Theo em, điều gì giúp chúng ta hiểu rõ nhất về cuộc sống Cửa Việt trong quá khứ? Hãy thử trả lời những câu hỏi dưới đây!</p><p>Bộ câu hỏi khởi động</p><p>Câu 1. Nguồn tư liệu nào có thể giúp chúng ta hiểu thêm về cuộc sống của người dân Cửa Việt trong quá khứ?</p><p>A. Chỉ có sách giáo khoa.</p><p>B. Lời kể của những người từng sống và gắn bó với địa phương.</p><p>C. Chỉ có bản đồ hiện nay.</p><p>D. Chỉ có những hình ảnh du lịch.</p><p>Câu 2. Ai có thể trở thành người kể chuyện về Cửa Việt?</p><p>A. Chỉ có cựu chiến binh.</p><p>B. Chỉ có người cao tuổi.</p><p>C. Cựu chiến binh, ngư dân, người cao tuổi và những người gắn bó với địa phương.</p><p>D. Chỉ có cán bộ địa phương.</p><p>Câu 3. Khi phỏng vấn một nhân chứng lịch sử, học sinh cần làm gì?</p><p>A. Tự ý thay đổi nội dung lời kể.</p><p>B. Ghi âm, ghi hình khi chưa được đồng ý.</p><p>C. Lắng nghe, đặt câu hỏi phù hợp và ghi lại trung thực lời kể.</p><p>D. Chỉ ghi những nội dung mình thích.</p><p>Câu 4. Vì sao cần lưu giữ những câu chuyện của người dân địa phương?</p><p>A. Để giải trí.</p><p>B. Để bảo tồn ký ức, lịch sử và văn hóa cộng đồng.</p><p>C. Để thay thế hoàn toàn sách lịch sử.</p><p>D. Chỉ để đăng tải lên mạng xã hội.</p><p>Câu 5. Tư liệu nào có thể được số hóa để lưu giữ ký ức địa phương?</p><p>A. Bản ghi âm, video, hình ảnh và câu chuyện được ghi chép.</p><p>B. Chỉ có văn bản.</p><p>C. Chỉ có hình ảnh.</p><p>D. Chỉ có bản đồ.</p><p>Đáp án: 1B – 2C – 3C – 4B – 5A.</p>", "photos": [], "extra": []}, "3": {"html": "<h4>HÃY KÉO THANH TRƯỢT ĐỂ KHÁM PHÁ NHỮNG KÝ ỨC CÒN LƯU GIỮ TRONG HÌNH ẢNH!</h4><p>Mỗi bức ảnh là một lát cắt của cuộc sống. Có những bức ảnh ghi lại một thời chiến tranh gian khó, có những bức ảnh lưu giữ hình ảnh làng quê, con thuyền, bến cá và những sinh hoạt đời thường của người dân.</p><p>Hãy quan sát hình ảnh Cửa Việt xưa và nay để khám phá:</p><div class=\"station-table\"><table><tr><th>Chủ đề</th><th>Nội dung quan sát</th></tr><tr><td>Làng quê ngày trước</td><td>Nhà cửa, đường làng, cảnh quan và sinh hoạt cộng đồng.</td></tr><tr><td>Nghề biển</td><td>Thuyền đánh cá, ngư cụ, bến cá và hoạt động ra khơi.</td></tr><tr><td>Cuộc sống gia đình</td><td>Trang phục, sinh hoạt, lao động và những hình ảnh đời thường.</td></tr><tr><td>Dấu ấn chiến tranh</td><td>Hình ảnh con người, làng quê và cuộc sống trong những năm tháng chiến tranh.</td></tr><tr><td>Cửa Việt hôm nay</td><td>Những đổi thay trong cảnh quan, nghề nghiệp và đời sống người dân.</td></tr></table></div><h4>Câu hỏi khám phá</h4><p>Hình ảnh nào khiến em ấn tượng nhất?</p><p>Cuộc sống của người dân Cửa Việt xưa có gì khác so với hiện nay?</p><p>Qua những bức ảnh, em nhận thấy điều gì vẫn được lưu giữ trong đời sống cộng đồng?</p>", "photos": [], "extra": []}, "4": {"html": "<h4>HÃY LẮNG NGHE – BỞI MỖI NGƯỜI DÂN ĐỀU CÓ MỘT CÂU CHUYỆN ĐÁNG ĐƯỢC LƯU GIỮ.</h4><p>Có những câu chuyện không được ghi chép trong sách vở nhưng vẫn sống mãi trong ký ức của những người từng trải qua.</p><p>Đó là lời kể của người lính về những năm tháng chiến đấu; câu chuyện của ngư dân về những chuyến ra khơi, những mùa biển động; ký ức của người cao tuổi về làng quê, phong tục và cuộc sống của cộng đồng cư dân ven biển.</p><p>Hãy cùng lắng nghe những câu chuyện ấy qua tiếng nói của chính người dân Cửa Việt.</p><h4>Gợi ý các nhóm nhân vật và câu chuyện</h4><div class=\"station-table\"><table><tr><th>Người kể chuyện</th><th>Nội dung câu chuyện</th></tr><tr><td>Cựu chiến binh</td><td>Ký ức chiến tranh, những năm tháng chiến đấu, tình đồng đội và ngày trở về.</td></tr><tr><td>Ngư dân cao tuổi</td><td>Những chuyến ra khơi, nghề đánh bắt truyền thống, kinh nghiệm đi biển.</td></tr><tr><td>Người cao tuổi trong làng</td><td>Làng quê xưa, nếp sống, phong tục và sự thay đổi của quê hương.</td></tr><tr><td>Người làm nghề truyền thống</td><td>Cách làm nghề, công cụ lao động và những kinh nghiệm được truyền qua nhiều thế hệ.</td></tr><tr><td>Người dân gắn bó lâu năm với Cửa Việt</td><td>Những đổi thay của vùng cửa biển, đời sống và sinh hoạt cộng đồng.</td></tr></table></div><h4>Gợi ý câu hỏi phỏng vấn</h4><p>Dành cho cựu chiến binh:</p><p>Bác có thể kể cho chúng cháu nghe một kỷ niệm đáng nhớ nhất trong những năm tháng chiến đấu gắn với vùng đất Cửa Việt không?</p><p>Điều gì khiến bác nhớ nhất khi nghĩ về đồng đội và những năm tháng chiến tranh?</p><p>Bác mong muốn thế hệ trẻ hôm nay hiểu điều gì về lịch sử quê hương?</p><p>Dành cho ngư dân cao tuổi:</p><p>Bác có thể kể về những chuyến ra khơi và công việc đánh bắt cá ngày trước không?</p><p>Nghề biển đã thay đổi như thế nào qua các thế hệ?</p><p>Theo bác, điều gì làm nên nét đặc trưng của người dân vùng biển Cửa Việt?</p><p>Dành cho người cao tuổi trong làng:</p><p>Bác có thể kể về diện mạo làng quê Cửa Việt ngày trước không?</p><p>Những phong tục, tập quán hoặc sinh hoạt cộng đồng nào khiến bác nhớ nhất?</p><p>Bác mong muốn thế hệ trẻ gìn giữ những nét đẹp nào của quê hương?</p>", "photos": ["<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"3_image1\" data-caption=\"Mã QR tư liệu bài viết/phỏng vấn trong file Chạm 03\" aria-label=\"Phóng to Mã QR tư liệu bài viết/phỏng vấn trong file Chạm 03\"><img src=\"@3_image1@\" alt=\"Mã QR tư liệu bài viết/phỏng vấn trong file Chạm 03\" loading=\"lazy\"></button><figcaption>Mã QR tư liệu bài viết/phỏng vấn trong file Chạm 03</figcaption></figure>"], "extra": []}, "5": {"html": "<h3>Khám phá những câu chuyện – Lưu giữ hồn quê Cửa Việt</h3><p>Những câu chuyện được kể không chỉ giúp chúng ta hiểu về một con người mà còn mở ra bức tranh về lịch sử, văn hóa và cuộc sống của cả một cộng đồng.</p><p>Nội dung được chia thành 4 nhóm chủ đề chính:</p><h4>a. Ký ức chiến tranh – Những năm tháng không thể quên</h4><p>Giới thiệu những câu chuyện về chiến tranh, tình đồng đội, sự hy sinh, tinh thần kiên cường và khát vọng hòa bình của người dân Cửa Việt.</p><figure class=\"station-monument\"><img src=\"assets/cham-3-ky-uc-chien-tranh-be-go.png\" width=\"975\" height=\"527\" alt=\"Những người lính trên bè gỗ giữa sóng biển\" loading=\"lazy\" decoding=\"async\"></figure><figure class=\"station-monument\"><img src=\"https://photo-baomoi.bmcdn.me/w1000_r1/2016_04_07_180_19067417/ddd3ed7a2f3ac6649f2b.jpg\" width=\"1000\" height=\"650\" alt=\"Xe tăng trong chiến dịch năm 1972\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"><figcaption>Xe tăng trong chiến dịch năm 1972. · <a href=\"https://baomoi.com/soi-xe-tang-boi-k63-85-cua-hai-quan-danh-bo-viet-nam-c19067417.epi\" target=\"_blank\" rel=\"noopener noreferrer\">Tri thức và Cuộc sống / Báo Mới</a></figcaption></figure><h4>b. Ký ức nghề biển – Một đời gắn bó với sóng nước</h4><p>Khám phá những câu chuyện về nghề đánh bắt thủy sản, kinh nghiệm đi biển, phương tiện đánh bắt, những chuyến ra khơi và tình yêu biển của ngư dân.</p><div class=\"station-gallery station-topic-photos\"><figure><img src=\"assets/cham-3-keo-luoi.webp\" width=\"1200\" height=\"796\" alt=\"Ngư dân cùng kéo lưới đánh bắt ven biển\" loading=\"lazy\" decoding=\"async\"><figcaption>Ngư dân cùng kéo lưới đánh bắt ven biển. Ảnh minh họa của <a href=\"https://www.pexels.com/photo/vietnamese-fishermen-pulling-nets-at-sea-37581455/\" target=\"_blank\" rel=\"noopener noreferrer\">Tiến Đạt Lê / Pexels</a>.</figcaption></figure><figure><img src=\"assets/cham-3-lam-nuoc-mam.webp\" width=\"1200\" height=\"800\" alt=\"Người làm nước mắm làm việc bên các thùng ủ\" loading=\"lazy\" decoding=\"async\"><figcaption>Người làm nước mắm làm việc bên các thùng ủ. Ảnh minh họa của <a href=\"https://www.pexels.com/photo/fish-sauce-manufacture-with-workers-near-barrels-6711654/\" target=\"_blank\" rel=\"noopener noreferrer\">Quang Nguyen Vinh / Pexels</a>.</figcaption></figure></div><h4>c. Ký ức làng quê – Nếp sống và tình người</h4><p>Tìm hiểu về diện mạo làng quê ngày trước, cuộc sống gia đình, quan hệ xóm giềng, sinh hoạt cộng đồng và những nét đẹp trong đời sống thường ngày.</p><div class=\"station-gallery station-topic-photos\"><figure><img src=\"assets/anh-nhom/img-3985.webp\" width=\"960\" height=\"544\" alt=\"Toàn cảnh khu dân cư nhìn từ trên cao.\" loading=\"lazy\" decoding=\"async\"><figcaption>Toàn cảnh khu dân cư nhìn từ trên cao.</figcaption></figure><figure><img src=\"assets/anh-nhom/img-3961.webp\" width=\"960\" height=\"720\" alt=\"Không gian ven biển Cửa Việt và khu vực cổng chào.\" loading=\"lazy\" decoding=\"async\"><figcaption>Không gian ven biển Cửa Việt và khu vực cổng chào.</figcaption></figure></div><h4>d. Ký ức văn hóa – Những giá trị được trao truyền</h4><p>Khám phá phong tục, tập quán, lễ hội cầu ngư, tín ngưỡng và những kinh nghiệm dân gian được người dân gìn giữ, truyền lại qua nhiều thế hệ.</p><div class=\"station-gallery station-topic-photos\"><figure><img src=\"assets/anh-nhom/img-3959.webp\" width=\"1120\" height=\"746\" alt=\"Các đội đua thuyền đi qua dưới chân cầu.\" loading=\"lazy\" decoding=\"async\"><figcaption>Các đội đua thuyền đi qua dưới chân cầu.</figcaption></figure><figure><img src=\"assets/anh-nhom/img-3963.webp\" width=\"1200\" height=\"787\" alt=\"Các đội tham gia giải đua thuyền truyền thống.\" loading=\"lazy\" decoding=\"async\"><figcaption>Các đội tham gia giải đua thuyền truyền thống.</figcaption></figure></div>", "photos": [], "extra": []}, "6": {"html": "<p>Bạn vừa lắng nghe những câu chuyện về con người và cuộc sống Cửa Việt. Hãy thử xem mình đã ghi nhớ được những điều gì nhé!</p><p>Bộ câu hỏi kiểm tra</p><p>Câu 1. Ai có thể trở thành người kể chuyện về Cửa Việt?</p><p>A. Chỉ có những người làm công tác nghiên cứu lịch sử.</p><p>B. Chỉ có cán bộ địa phương.</p><p>C. Những người từng sống, chiến đấu, lao động và gắn bó với Cửa Việt.</p><p>D. Chỉ có học sinh.</p><p>Câu 2. Khi phỏng vấn người dân địa phương, học sinh cần chú ý điều gì?</p><p>A. Ghi lại trung thực nội dung câu chuyện.</p><p>B. Tự ý thay đổi lời kể.</p><p>C. Chỉ ghi những nội dung gây chú ý.</p><p>D. Không cần ghi nguồn tư liệu.</p><p>Câu 3. Những câu chuyện của ngư dân cao tuổi có thể giúp chúng ta tìm hiểu điều gì?</p><p>A. Chỉ về hoạt động du lịch.</p><p>B. Nghề biển, kinh nghiệm đi biển và đời sống cư dân ven biển.</p><p>C. Chỉ về các công trình xây dựng.</p><p>D. Chỉ về hoạt động thương mại.</p><p>Câu 4. Vì sao cần số hóa các câu chuyện của người dân?</p><p>A. Để thay thế hoàn toàn việc gặp gỡ nhân chứng.</p><p>B. Để lưu giữ, bảo quản và chia sẻ ký ức đến nhiều người hơn.</p><p>C. Chỉ để tạo hình ảnh đẹp cho App/Web.</p><p>D. Để không cần kiểm chứng thông tin.</p><p>Câu 5. Việc lắng nghe và lưu giữ ký ức của người dân giúp học sinh điều gì?</p><p>A. Chỉ biết thêm tên các nhân vật.</p><p>B. Hiểu hơn về lịch sử, văn hóa và trân trọng giá trị quê hương.</p><p>C. Không cần tìm hiểu các nguồn tư liệu khác.</p><p>D. Chỉ ghi nhớ những câu chuyện giải trí.</p><p>Đáp án: 1C – 2A – 3B – 4B – 5B.</p>", "photos": [], "extra": []}, "7": {"html": "<h3>Điều gì ở lại trong bạn?</h3><p>Có những câu chuyện khi được lắng nghe sẽ trở thành ký ức của chính chúng ta.</p><p>Sau hành trình gặp gỡ và lắng nghe người dân Cửa Việt, bạn hãy chia sẻ:</p><p>Câu chuyện nào khiến bạn xúc động hoặc ấn tượng nhất? Vì sao?</p><p>Qua lời kể của người dân, bạn  hiểu thêm điều gì về quê hương Cửa Việt?</p><p>Bạn có câu chuyện nào được ông bà, cha mẹ kể về gia đình hoặc làng quê mình không?</p><p>Bạn muốn làm gì để những câu chuyện đẹp của quê hương không bị mai một?</p><h4>Gợi ý thông điệp</h4><p>&quot;Em nhận ra rằng mỗi người dân Cửa Việt đều đang lưu giữ một phần ký ức của quê hương. Bạn mong muốn được lắng nghe, ghi lại và chia sẻ những câu chuyện ấy để các thế hệ sau hiểu hơn, yêu hơn vùng đất mình đang sống.&quot;</p>", "photos": [], "extra": []}, "8": {"html": "", "photos": [], "extra": []}}, "4": {"1": {"html": "<h3>Nhịp sống làng biển – Nơi biển cả gắn bó với cuộc sống con người</h3><p>Cửa Việt là vùng đất gắn liền với biển, cửa sông và những làng quê ven biển. Từ bao đời nay, biển không chỉ mang lại nguồn sống mà còn góp phần hình thành nên những nét văn hóa đặc trưng của cộng đồng cư dân nơi đây.</p><p>Những con thuyền ra khơi từ sáng sớm, tiếng gọi nhau ở bến cá, những mẻ lưới sau chuyến biển và những sinh hoạt cộng đồng đã tạo nên nhịp sống riêng của làng biển Cửa Việt.</p><p>Không gian ấy còn lưu giữ nhiều giá trị văn hóa truyền thống như nghề đánh bắt thủy sản, lễ hội cầu ngư, phong tục tập quán, kinh nghiệm đi biển và những món ăn mang hương vị biển quê hương.</p>", "photos": ["<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image1\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 1\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 1\"><img src=\"@4_image1@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 1\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 1</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image2\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 2\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 2\"><img src=\"@4_image2@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 2\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 2</figcaption></figure>"], "extra": []}, "2": {"html": "<p>Bạn đã biết gì về cuộc sống của người dân làng biển Cửa Việt? Hãy thử sức với những câu hỏi dưới đây nhé!</p><p>Bộ câu hỏi khởi động</p><p>Câu 1. Nghề nghiệp truyền thống gắn bó lâu đời với cư dân vùng biển Cửa Việt là gì?</p><p>A. Trồng cây công nghiệp.</p><p>B. Đánh bắt và khai thác thủy sản.</p><p>C. Trồng lúa nước quy mô lớn.</p><p>D. Chăn nuôi gia súc trên núi.</p><p>Câu 2. Lễ hội cầu ngư của cư dân ven biển thường thể hiện mong ước nào?</p><p>A. Mùa màng bội thu.</p><p>B. Mưa thuận gió hòa, biển yên, đánh bắt thuận lợi.</p><p>C. Phát triển công nghiệp.</p><p>D. Mở rộng diện tích đất nông nghiệp.</p><p>Câu 3. Tri thức dân gian về nghề biển thường được hình thành từ đâu?</p><p>A. Kinh nghiệm thực tế được tích lũy và truyền lại qua nhiều thế hệ.</p><p>B. Chỉ từ sách giáo khoa.</p><p>C. Chỉ từ các thiết bị hiện đại.</p><p>D. Từ những hoạt động vui chơi giải trí.</p><p>Câu 4. Hoạt động nào góp phần giữ gìn bản sắc văn hóa làng biển?</p><p>A. Không quan tâm đến phong tục truyền thống.</p><p>B. Gìn giữ nghề truyền thống, lễ hội và các giá trị văn hóa địa phương.</p><p>C. Thay thế toàn bộ phong tục cũ.</p><p>D. Chỉ tập trung phát triển du lịch.</p><p>Câu 5. Học sinh có thể góp phần bảo tồn văn hóa làng biển bằng cách nào?</p><p>A. Tìm hiểu, ghi chép và giới thiệu những nét đẹp văn hóa quê hương.</p><p>B. Không tham gia các hoạt động cộng đồng.</p><p>C. Không quan tâm đến nghề truyền thống.</p><p>D. Chỉ tìm hiểu văn hóa ở những nơi khác.</p><p>Đáp án: 1B – 2B – 3A – 4B – 5A.</p>", "photos": [], "extra": []}, "3": {"html": "<h3>Kéo thanh trượt để khám phá nhịp sống làng biển xưa và nay</h3><p>Qua những bức ảnh cũ và mới, chúng ta có thể nhận ra nhiều đổi thay trong cuộc sống của người dân Cửa Việt. Từ những chiếc thuyền, ngư cụ truyền thống đến các phương tiện đánh bắt hiện đại; từ những bến cá giản dị đến hoạt động mua bán thủy sản ngày càng đa dạng.</p><p>Tuy cuộc sống có nhiều thay đổi nhưng tình yêu biển, tinh thần lao động và những giá trị văn hóa truyền thống vẫn là những nét đẹp đáng trân trọng.</p><h4>Các nội dung so sánh</h4><div class=\"station-table station-table--photos\"><table><thead><tr><th scope=\"col\">Chủ đề</th><th scope=\"col\">Nội dung quan sát</th></tr></thead><tbody><tr><th scope=\"row\">Thuyền và ngư cụ</th><td><a href=\"https://vov.vn/kinh-te/tu-nghi-quyet-den-ngu-truong-ron-rang-phien-bien-cuoi-nam-o-cua-viet-quang-tri-post1264316.vov\" title=\"Ảnh: VOV. Mở bài gốc.\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://media.vov.vn/sites/default/files/styles/large_watermark/public/2026-01/chuan_bi_ngu_cu_cho_phien_bien_moi.jpg\" width=\"1200\" height=\"674\" alt=\"Tàu cá cùng ngư cụ chuẩn bị cho chuyến biển ở Cửa Việt\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a></td></tr><tr><th scope=\"row\">Hoạt động nghề biển</th><td><a href=\"https://xanhx.vn/du-lich-az/phong-su-anh-duoc-mua-ruoc-bien-21268.html\" title=\"Ảnh: Lê Trường / XANH EWEC. Mở bài gốc.\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://media-cdn.xanhx.vn/storage/newsportal/2022/11/30/21268/Ruoc-Bien.jpg\" width=\"2000\" height=\"1125\" alt=\"Thuyền ngư dân đánh bắt ruốc ven biển Cửa Việt\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a></td></tr><tr><th scope=\"row\">Chợ và bến cá</th><td><a href=\"https://vnanet.vn/vi/anh/anh-thoi-su-trong-nuoc-1014/ngu-dan-quang-tri-trung-dam-ca-com-ca-nuc-8201110.html\" title=\"Ảnh: Tường Vi / TTXVN. Mở bài gốc.\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://vnanet.vn/Data/Articles/2025/08/10/8201100/vna_potal_ngu_dan_quang_tri_co_thu_nhap_cao_nho_danh_bat_luong_lon_ca_com_ca_nuc_stand.jpg\" width=\"665\" height=\"459\" alt=\"Thương lái thu mua cá cơm ở Bến cá Bắc Cửa Việt\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a></td></tr><tr><th scope=\"row\">Đời sống làng quê</th><td><a href=\"https://dantri.com.vn/lao-dong-viec-lam/nhung-biet-phu-moc-len-noi-lang-bien-20260416115604416.htm\" title=\"Ảnh: Nhật Anh / Dân trí. Mở bài gốc.\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://cdnphoto.dantri.com.vn/U32ipBdtofAJLDtOWyo23Ltj40U=/thumb_w/1020/2026/04/17/lang-que-nhieu-nha-dep-nho-di-lao-dong-nuoc-ngoainhat-anh-3-1776385689201.jpg?watermark=v1\" width=\"1020\" height=\"680\" alt=\"Nhà dân dọc đường ven biển ở xã Cửa Việt\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a></td></tr><tr><th scope=\"row\">Văn hóa truyền thống</th><td><a href=\"https://tuoitre.vn/le-cau-ngu-linh-thieng-giua-bien-khoi-20240402231440858.htm\" title=\"Ảnh: Hoàng Táo / Tuổi Trẻ. Mở bài gốc.\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"https://cdn.tuoitre.vn/thumb_w/960/471584752817336320/2024/4/2/30-03-baoin-cau-ngu-2-002-read-only-1712072311908219645188.jpg\" width=\"960\" height=\"640\" alt=\"Ngư dân thực hiện nghi thức cầu ngư tại cửa biển Cửa Việt\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a></td></tr></tbody></table></div><h4>Câu hỏi khám phá</h4><p>Nghề biển của người dân Cửa Việt đã thay đổi như thế nào?</p><p>Những nét đẹp văn hóa nào vẫn được gìn giữ?</p><p>Theo em, vì sao cần lưu giữ những hình ảnh về đời sống làng biển ngày trước?</p>", "photos": ["<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image3\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 3\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 3\"><img src=\"@4_image3@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 3\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 3</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image4\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 4\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 4\"><img src=\"@4_image4@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 4\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 4</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image5\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 5\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 5\"><img src=\"@4_image5@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 5\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 5</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image6\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 6\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 6\"><img src=\"@4_image6@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 6\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 6</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image7\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 7\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 7\"><img src=\"@4_image7@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 7\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 7</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"4_image8\" data-caption=\"Ảnh từ tài liệu Chạm 04 · ảnh 8\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 04 · ảnh 8\"><img src=\"@4_image8@\" alt=\"Ảnh từ tài liệu Chạm 04 · ảnh 8\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 04 · ảnh 8</figcaption></figure>"], "extra": []}, "4": {"html": "<h4>LẮNG NGHE TIẾNG BIỂN QUA LỜI KỂ CỦA NHỮNG NGƯỜI GẮN BÓ VỚI BIỂN.</h4><p>Đằng sau mỗi chuyến ra khơi là những kinh nghiệm được tích lũy qua nhiều năm tháng. Đằng sau mỗi lễ hội, phong tục là những quan niệm, niềm tin và mong ước của cộng đồng cư dân ven biển.</p><p>Hãy cùng lắng nghe những người đã sống, lao động và gắn bó với biển kể về nhịp sống làng quê Cửa Việt.</p><h4>Gợi ý nhân vật và nội dung phỏng vấn</h4><div class=\"station-table\"><table><tr><th>Nhân vật</th><th>Nội dung phỏng vấn</th></tr><tr><td>Ngư dân cao tuổi</td><td>Nghề đánh bắt truyền thống, kinh nghiệm đi biển, những chuyến ra khơi đáng nhớ.</td></tr><tr><td>Người am hiểu lễ hội</td><td>Nguồn gốc, ý nghĩa và các hoạt động trong lễ hội cầu ngư tại địa phương.</td></tr><tr><td>Người cao tuổi trong làng</td><td>Phong tục, tập quán, sinh hoạt cộng đồng và sự thay đổi của làng quê.</td></tr><tr><td>Người làm nghề truyền thống</td><td>Cách chế biến hải sản, bảo quản sản phẩm và kinh nghiệm nghề nghiệp.</td></tr><tr><td>Người dân địa phương</td><td>Những món ăn, câu ca, tục ngữ và nét văn hóa gắn với cuộc sống ven biển.</td></tr></table></div><h4>Gợi ý câu hỏi phỏng vấn</h4><p>Bác có thể kể cho chúng cháu nghe về công việc đánh bắt thủy sản của người dân Cửa Việt ngày trước không?</p><p>Trong nghề biển, những kinh nghiệm nào được người đi trước truyền lại cho thế hệ sau?</p><p>Bác có thể giới thiệu về lễ hội cầu ngư và ý nghĩa của lễ hội đối với người dân địa phương không?</p><p>Những phong tục, tập quán nào của làng biển vẫn được người dân gìn giữ đến ngày nay?</p><p>Theo bác, thế hệ trẻ cần làm gì để bảo tồn và phát huy những nét đẹp văn hóa của quê hương?</p>", "photos": [], "extra": []}, "5": {"html": "<h3>Khám phá bản sắc văn hóa – Cảm nhận hồn quê làng biển</h3><p>Văn hóa làng biển được hình thành từ quá trình con người thích nghi với môi trường biển, lao động sản xuất và sinh hoạt cộng đồng. Những giá trị ấy được thể hiện qua nhiều khía cạnh của cuộc sống.</p><h4>a. Nghề biển – Nhịp sống từ đại dương</h4><p>Nghề đánh bắt và khai thác thủy sản là một hoạt động kinh tế gắn bó lâu đời với cư dân ven biển. Nghề biển không chỉ tạo ra nguồn sống mà còn hình thành những kinh nghiệm, kỹ năng và nếp sinh hoạt đặc trưng.</p><figure class=\"station-monument\"><a href=\"https://media-cdn.xanhx.vn/storage/newsportal/2022/11/30/21268/Ruoc-Bien.jpg\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Xem ảnh lớn: Thuyền của ngư dân đánh bắt ruốc ven biển Cửa Việt.\"><img src=\"https://media-cdn.xanhx.vn/storage/newsportal/2022/11/30/21268/Ruoc-Bien.jpg\" width=\"2000\" height=\"1125\" alt=\"Thuyền của ngư dân đánh bắt ruốc ven biển Cửa Việt.\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a><figcaption>Thuyền của ngư dân đánh bắt ruốc ven biển Cửa Việt. · <a href=\"https://xanhx.vn/du-lich-az/phong-su-anh-duoc-mua-ruoc-bien-21268.html\" target=\"_blank\" rel=\"noopener noreferrer\">Lê Trường / XANH EWEC</a></figcaption></figure><h4>b. Lễ hội cầu ngư – Niềm tin và khát vọng của cư dân biển</h4><p>Lễ hội cầu ngư là một sinh hoạt văn hóa tín ngưỡng gắn với cộng đồng cư dân ven biển ở nhiều địa phương. Lễ hội thể hiện mong ước biển yên, trời thuận, đánh bắt thuận lợi, cuộc sống bình an và no đủ.</p><figure class=\"station-monument\"><a href=\"https://cdn.tuoitre.vn/thumb_w/960/471584752817336320/2024/4/2/30-03-baoin-cau-ngu-1-002-read-only-1712072311902825682329.jpg\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Xem ảnh lớn: Ngư dân Gio Việt làm lễ cầu ngư trên thuyền tại cửa biển Cửa Việt.\"><img src=\"https://cdn.tuoitre.vn/thumb_w/960/471584752817336320/2024/4/2/30-03-baoin-cau-ngu-1-002-read-only-1712072311902825682329.jpg\" width=\"960\" height=\"640\" alt=\"Ngư dân Gio Việt làm lễ cầu ngư trên thuyền tại cửa biển Cửa Việt.\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a><figcaption>Ngư dân Gio Việt làm lễ cầu ngư trên thuyền tại cửa biển Cửa Việt. · <a href=\"https://tuoitre.vn/le-cau-ngu-linh-thieng-giua-bien-khoi-20240402231440858.htm\" target=\"_blank\" rel=\"noopener noreferrer\">Hoàng Táo / Tuổi Trẻ</a></figcaption></figure><p>Lưu ý: Nội dung về tên gọi, thời gian, nghi thức và địa điểm tổ chức lễ hội cầu ngư tại Cửa Việt cần được học sinh xác minh qua người am hiểu văn hóa và tư liệu địa phương, không mặc định mọi địa phương đều có nghi thức giống nhau.</p><h4>c. Phong tục tập quán – Nét đẹp trong đời sống cộng đồng</h4><p>Cuộc sống của cư dân ven biển được gắn kết bởi nhiều phong tục và tập quán trong lao động, sinh hoạt gia đình và hoạt động cộng đồng.</p><figure class=\"station-monument\"><a href=\"https://cdn2.tuoitre.vn/thumb_w/960/471584752817336320/2026/2/6/base64-1770365888426535547236.jpeg\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Xem ảnh lớn: Các tàu cá của một tổ đội ghép lại để làm lễ tất niên ở cửa biển Cửa Việt.\"><img src=\"https://cdn2.tuoitre.vn/thumb_w/960/471584752817336320/2026/2/6/base64-1770365888426535547236.jpeg\" width=\"960\" height=\"640\" alt=\"Các tàu cá của một tổ đội ghép lại để làm lễ tất niên ở cửa biển Cửa Việt.\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a><figcaption>Các tàu cá của một tổ đội ghép lại để làm lễ tất niên ở cửa biển Cửa Việt. · <a href=\"https://tuoitre.vn/dan-chai-dong-thuyen-cung-tat-nien-o-cua-bien-20260206151811611.htm\" target=\"_blank\" rel=\"noopener noreferrer\">Hoàng Táo / Tuổi Trẻ</a></figcaption></figure><h4>d. Tri thức dân gian – Kinh nghiệm từ biển cả</h4><p>Qua quá trình lao động, người dân tích lũy nhiều kinh nghiệm về thời tiết, gió, sóng, thủy triều, mùa vụ và hoạt động đánh bắt.</p><figure class=\"station-monument\"><a href=\"https://bcp.cdnchinhphu.vn/Uploaded/buithuhuong/2018_03_30/Anh%20QT.jpg\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Xem ảnh lớn: Tàu cá ra khơi ở Cửa Việt vào đầu vụ cá Nam.\"><img src=\"https://bcp.cdnchinhphu.vn/Uploaded/buithuhuong/2018_03_30/Anh%20QT.jpg\" width=\"1620\" height=\"1080\" alt=\"Tàu cá ra khơi ở Cửa Việt vào đầu vụ cá Nam.\" loading=\"lazy\" decoding=\"async\" referrerpolicy=\"no-referrer\"></a><figcaption>Tàu cá ra khơi ở Cửa Việt vào đầu vụ cá Nam. · <a href=\"https://baochinhphu.vn/ngu-dan-quang-tri-hi-vong-boi-thu-vu-ca-nam-102236711.htm\" target=\"_blank\" rel=\"noopener noreferrer\">Minh Trang / Báo Điện tử Chính phủ</a></figcaption></figure><h4>e. Ẩm thực làng biển – Hương vị quê hương</h4><p>Ẩm thực là một phần quan trọng trong đời sống văn hóa của cư dân ven biển, phản ánh nguồn nguyên liệu từ biển và cách chế biến được truyền qua nhiều thế hệ.</p><div class=\"station-gallery station-topic-photos station-food-photos\"><figure class=\"station-monument\"><a href=\"assets/cham-4-bun-hen-mai-xa.webp\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Xem ảnh lớn: Chuẩn bị bún hến Mai Xá tại lễ hội ẩm thực ở Cửa Việt năm 2023.\"><img src=\"assets/cham-4-bun-hen-mai-xa.webp\" width=\"825\" height=\"1100\" alt=\"Chuẩn bị bún hến Mai Xá tại lễ hội ẩm thực ở Cửa Việt năm 2023.\" loading=\"lazy\" decoding=\"async\"></a><figcaption>Chuẩn bị bún hến Mai Xá tại lễ hội ẩm thực ở Cửa Việt năm 2023. · <a href=\"https://commons.wikimedia.org/wiki/File:L%E1%BB%85_h%E1%BB%99i_%E1%BA%A9m_th%E1%BB%B1c_C%E1%BB%ADa_Vi%E1%BB%87t_th4n2023_%28gian_h%C3%A0ng_b%C3%BAn_h%E1%BA%BFn_Mai_X%C3%A1%29_%282%29.jpg\" target=\"_blank\" rel=\"noopener noreferrer\">Phương Huy / Wikimedia Commons</a> · <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" target=\"_blank\" rel=\"license noopener noreferrer\">CC BY-SA 4.0</a> · Ảnh thu nhỏ.</figcaption></figure><figure class=\"station-monument\"><a href=\"assets/cham-4-hai-san-ven-bien.webp\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Xem ảnh lớn: Không gian ven biển và các món tôm, hàu.\"><img src=\"assets/cham-4-hai-san-ven-bien.webp\" width=\"960\" height=\"1700\" alt=\"Không gian ven biển và các món tôm, hàu.\" loading=\"lazy\" decoding=\"async\"></a><figcaption>Không gian ven biển và các món tôm, hàu. · Ảnh do bạn cung cấp.</figcaption></figure></div>", "photos": [], "extra": []}, "6": {"html": "<p>Bạn vừa khám phá những nét đẹp văn hóa làng biển Cửa Việt. Hãy thử xem mình đã ghi nhớ được bao nhiêu nhé!</p><p>Bộ câu hỏi kiểm tra</p><p>Câu 1. Nghề nghiệp gắn bó lâu đời với cư dân ven biển Cửa Việt là gì?</p><p>A. Khai thác khoáng sản.</p><p>B. Đánh bắt và khai thác thủy sản.</p><p>C. Trồng cây công nghiệp.</p><p>D. Chăn nuôi gia súc trên núi.</p><p>Câu 2. Lễ hội cầu ngư thường thể hiện mong ước nào của cư dân ven biển?</p><p>A. Biển yên, trời thuận, đánh bắt thuận lợi và cuộc sống bình an.</p><p>B. Mở rộng diện tích đất nông nghiệp.</p><p>C. Phát triển các khu công nghiệp.</p><p>D. Tăng diện tích rừng trồng.</p><p>Câu 3. Tri thức dân gian về nghề biển chủ yếu được hình thành từ đâu?</p><p>A. Kinh nghiệm thực tế trong lao động và cuộc sống.</p><p>B. Các hoạt động vui chơi.</p><p>C. Những thông tin quảng cáo.</p><p>D. Các trò chơi trên mạng.</p><p>Câu 4. Hoạt động nào góp phần gìn giữ văn hóa làng biển?</p><p>A. Bỏ qua các phong tục truyền thống.</p><p>B. Tìm hiểu, ghi chép và tham gia các hoạt động văn hóa phù hợp.</p><p>C. Không quan tâm đến nghề truyền thống.</p><p>D. Chỉ lưu giữ những hình ảnh hiện đại.</p><p>Câu 5. Vì sao cần bảo tồn các giá trị văn hóa làng biển?</p><p>A. Vì đó là những giá trị gắn với bản sắc và đời sống cộng đồng.</p><p>B. Vì chỉ có ý nghĩa đối với người cao tuổi.</p><p>C. Vì có thể thay thế mọi hoạt động kinh tế.</p><p>D. Vì không cần thay đổi trong cuộc sống hiện đại.</p><p>Đáp án: 1B – 2A – 3A – 4B – 5A.</p>", "photos": [], "extra": []}, "7": {"html": "<h3>Làng biển trong bạn – Những điều bình dị và đáng trân trọng</h3><p>Sau hành trình khám phá nhịp sống làng biển Cửa Việt, bạn hãy chia sẻ:</p><p>Điều gì khiến bạn ấn tượng nhất về đời sống của người dân vùng biển?</p><p>Bạn biết những món ăn, phong tục hoặc lễ hội nào gắn với quê hương mình?</p><p>Nếu được giới thiệu một nét đẹp văn hóa Cửa Việt với bạn bè ở nơi khác, bạn sẽ chọn điều gì?</p><p>Bạn có thể làm gì để góp phần giữ gìn những giá trị văn hóa làng biển?</p><h4>Gợi ý thông điệp</h4><p>&quot;Em tự hào về những nét đẹp văn hóa của quê hương Cửa Việt. Bạn mong muốn được tìm hiểu, lưu giữ và giới thiệu những giá trị ấy để văn hóa làng biển luôn được tiếp nối qua các thế hệ.&quot;</p>", "photos": [], "extra": []}, "8": {"html": "", "photos": [], "extra": []}}, "5": {"1": {"html": "<h3>Cửa Việt trong mắt người trẻ</h3><p>Cửa Việt – vùng biển mang vẻ đẹp tự nhiên, những dấu ấn văn hóa và tiềm năng phát triển du lịch.</p><p>Nếu giới thiệu Cửa Việt với một người bạn ở nơi khác, bạn sẽ chọn địa điểm nào đầu tiên?</p>", "photos": ["<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"5_image1\" data-caption=\"Ảnh từ tài liệu Chạm 05 · ảnh 1\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 05 · ảnh 1\"><img src=\"@5_image1@\" alt=\"Ảnh từ tài liệu Chạm 05 · ảnh 1\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 05 · ảnh 1</figcaption></figure>"], "extra": []}, "2": {"html": "<div class=\"station-table\"><table><tr><th>Thành phần</th><th>Nội dung hiển thị</th></tr><tr><td>Tiêu đề</td><td>THỬ ĐOÁN XEM!</td></tr><tr><td>Hình ảnh 1</td><td>Bình minh hoặc hoàng hôn trên biển Cửa Việt</td></tr><tr><td>Hình ảnh 2</td><td>Những chiếc thuyền và hoạt động của ngư dân</td></tr><tr><td>Hình ảnh 3</td><td>Không gian biển, làng quê và đời sống địa phương</td></tr><tr><td>Câu hỏi</td><td>Theo em, điều gì khiến Cửa Việt trở nên hấp dẫn trong mắt du khách trẻ?</td></tr></table></div>", "photos": [], "extra": []}, "3": {"html": "<h3>Cửa Việt xưa và nay</h3><p>Cửa Việt đã thay đổi như thế nào? Những giá trị nào cần được gìn giữ trong quá trình phát triển?</p><p>Quan sát cảnh quan tự nhiên, không gian ven biển, đời sống người dân và hoạt động du lịch.</p>", "photos": ["<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"5_image2\" data-caption=\"Ảnh từ tài liệu Chạm 05 · ảnh 2\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 05 · ảnh 2\"><img src=\"@5_image2@\" alt=\"Ảnh từ tài liệu Chạm 05 · ảnh 2\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 05 · ảnh 2</figcaption></figure>", "<figure class=\"station-photo\"><button type=\"button\" data-action=\"station-photo\" data-key=\"5_image3\" data-caption=\"Ảnh từ tài liệu Chạm 05 · ảnh 3\" aria-label=\"Phóng to Ảnh từ tài liệu Chạm 05 · ảnh 3\"><img src=\"@5_image3@\" alt=\"Ảnh từ tài liệu Chạm 05 · ảnh 3\" loading=\"lazy\"></button><figcaption>Ảnh từ tài liệu Chạm 05 · ảnh 3</figcaption></figure>"], "extra": []}, "4": {"html": "<h3>Lắng nghe góc nhìn người trẻ</h3><p>Những ký ức về Cửa Việt, điểm đến yêu thích và mong muốn phát triển du lịch quê hương.</p><p>Người trẻ mong muốn Cửa Việt sẽ thay đổi như thế nào trong tương lai?</p><h4>Câu hỏi phỏng vấn gợi ý</h4><ul><li>Khi nhắc đến Cửa Việt, điều gì khiến bạn ấn tượng và tự hào nhất?</li><li>Theo bạn, những địa điểm nào ở Cửa Việt có sức hấp dẫn đối với khách du lịch, đặc biệt là giới trẻ?</li><li>Bạn thường lựa chọn những hoạt động nào khi đến biển Cửa Việt?</li><li>Theo bạn, Cửa Việt còn có những tiềm năng du lịch nào chưa được khai thác hiệu quả?</li><li>Bạn mong muốn địa phương phát triển thêm những loại hình hoặc hoạt động du lịch nào?</li><li>Người trẻ có thể làm gì để quảng bá hình ảnh Cửa Việt và góp phần bảo vệ môi trường biển?</li></ul>", "photos": [], "extra": ["Học sinh có thể sử dụng các câu hỏi sau:", "Khi nhắc đến Cửa Việt, điều gì khiến bạn ấn tượng và tự hào nhất?", "Theo bạn, những địa điểm nào ở Cửa Việt có sức hấp dẫn đối với khách du lịch, đặc biệt là giới trẻ?", "Bạn thường lựa chọn những hoạt động nào khi đến biển Cửa Việt?", "Theo bạn, Cửa Việt còn có những tiềm năng du lịch nào chưa được khai thác hiệu quả?", "Bạn mong muốn địa phương phát triển thêm những loại hình hoặc hoạt động du lịch nào?", "Người trẻ có thể làm gì để quảng bá hình ảnh Cửa Việt và góp phần bảo vệ môi trường biển?"]}, "5": {"html": "<h3>Bốn không gian sáng tạo</h3><details class=\"timeline-entry\"><summary>Cửa Việt qua ống kính trẻ</summary><p>Những bức ảnh đẹp về biển, cảnh quan, con người và cuộc sống địa phương.</p><button class=\"btn btn-outline\" data-action=\"project\" data-type=\"Cửa Việt qua ống kính trẻ\">Viết ý tưởng của bạn →</button></details><details class=\"timeline-entry\"><summary>Cửa Việt qua sắc màu nghệ thuật</summary><p>Tranh vẽ, thiết kế poster, thơ, bài viết và các sáng tác về quê hương.</p><button class=\"btn btn-outline\" data-action=\"project\" data-type=\"Cửa Việt qua sắc màu nghệ thuật\">Viết ý tưởng của bạn →</button></details><details class=\"timeline-entry\"><summary>Cửa Việt – Điểm hẹn du lịch</summary><p>Ý tưởng trải nghiệm, tham quan, khám phá văn hóa, ẩm thực và du lịch biển.</p><button class=\"btn btn-outline\" data-action=\"project\" data-type=\"Cửa Việt – Điểm hẹn du lịch\">Viết ý tưởng của bạn →</button></details><details class=\"timeline-entry\"><summary>Cửa Việt xanh trong tương lai</summary><p>Ý tưởng du lịch xanh, bảo vệ môi trường và phát triển du lịch bền vững.</p><button class=\"btn btn-outline\" data-action=\"project\" data-type=\"Cửa Việt xanh trong tương lai\">Viết ý tưởng của bạn →</button></details>", "photos": [], "extra": []}, "6": {"html": "<p>Học sinh trả lời 5 câu hỏi trắc nghiệm:</p><p>Thử sức cùng CHẠM 05</p><p>0/5 câu</p><p>Câu 1. Điều gì tạo nên sức hấp dẫn của Cửa Việt đối với du khách?</p><p>A. Chỉ có cảnh quan biển</p><p>B. Cảnh quan, văn hóa, con người và trải nghiệm địa phương</p><p>C. Chỉ có hoạt động đánh bắt thủy sản</p><p>D. Chỉ có các công trình xây dựng</p><p>Câu 2. Hình thức nào giúp người trẻ quảng bá hình ảnh Cửa Việt hiệu quả?</p><p>A. Chụp ảnh, làm video và chia sẻ thông tin có trách nhiệm</p><p>B. Đăng tải thông tin chưa kiểm chứng</p><p>C. Chỉ giới thiệu những nơi đông người</p><p>D. Không cần tìm hiểu địa phương</p><p>Câu 3. Sản phẩm nào thể hiện sự sáng tạo của học sinh trong quảng bá du lịch?</p><p>A. Tranh vẽ, poster, video giới thiệu địa phương</p><p>B. Bài chép nguyên văn trên Internet</p><p>C. Thông tin không có nguồn</p><p>D. Hình ảnh không liên quan</p><p>Câu 4. Phát triển du lịch bền vững cần gắn với điều gì?</p><p>A. Khai thác tài nguyên không giới hạn</p><p>B. Chỉ quan tâm đến lợi nhuận</p><p>C. Bảo vệ môi trường và gìn giữ bản sắc văn hóa</p><p>D. Tăng lượng rác thải du lịch</p><p>Câu 5. Học sinh có thể đóng góp gì cho quê hương Cửa Việt?</p><p>A. Sáng tạo sản phẩm quảng bá và tham gia bảo vệ môi trường</p><p>B. Thờ ơ với các giá trị địa phương</p><p>C. Chỉ quan tâm đến du lịch ở nơi khác</p><p>D. Không cần tìm hiểu lịch sử quê hương</p><p>Nộp câu trả lời</p>", "photos": [], "extra": []}, "7": {"html": "<h3>Gửi một điều đến Cửa Việt tương lai</h3><ul><li>Điều gì ở Cửa Việt khiến bạn yêu thích và tự hào nhất?</li><li>Nếu giới thiệu Cửa Việt với bạn bè ở nơi khác, bạn sẽ kể về điều gì?</li><li>Bạn mong muốn Cửa Việt sẽ trở thành điểm đến như thế nào trong tương lai?</li><li>Em sẽ làm gì để góp phần xây dựng hình ảnh Cửa Việt xanh, đẹp và thân thiện?</li></ul>", "photos": [], "extra": []}, "8": {"html": "", "photos": [], "extra": []}}};
const stationAssets={"3_image1": "assets/tu-lieu-32.webp", "4_image1": "assets/tu-lieu-33.webp", "4_image2": "assets/tu-lieu-34.webp", "4_image3": "assets/tu-lieu-35.webp", "4_image4": "assets/tu-lieu-36.webp", "4_image5": "assets/tu-lieu-37.webp", "4_image6": "assets/tu-lieu-38.webp", "4_image7": "assets/tu-lieu-39.webp", "4_image8": "assets/tu-lieu-40.webp", "4_image9": "assets/tu-lieu-41.webp", "4_image10": "assets/nhip-song-ben-ca.webp", "4_image11": "assets/tau-thuyen.webp", "4_image12": "assets/tu-lieu-44.webp", "4_image13": "assets/cang-ca.webp", "4_image14": "assets/cho-ca.webp", "4_image15": "assets/tu-lieu-47.webp", "4_image16": "assets/le-hoi.webp", "4_image17": "assets/le-hoi-lang-bien.webp", "5_image1": "assets/bo-bien-cua-viet.webp", "5_image2": "assets/tu-lieu-51.webp", "5_image3": "assets/tu-lieu-52.webp"};
Object.assign(questionBanks,{"3": {"guess": [{"q": "Nguồn tư liệu nào có thể giúp chúng ta hiểu thêm về cuộc sống của người dân Cửa Việt trong quá khứ?", "options": ["Chỉ có sách giáo khoa.", "Lời kể của những người từng sống và gắn bó với địa phương.", "Chỉ có bản đồ hiện nay.", "Chỉ có những hình ảnh du lịch."], "correct": 1, "explain": "Lời kể của những người từng sống và gắn bó với địa phương. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Ai có thể trở thành người kể chuyện về Cửa Việt?", "options": ["Chỉ có cựu chiến binh.", "Chỉ có người cao tuổi.", "Cựu chiến binh, ngư dân, người cao tuổi và những người gắn bó với địa phương.", "Chỉ có cán bộ địa phương."], "correct": 2, "explain": "Cựu chiến binh, ngư dân, người cao tuổi và những người gắn bó với địa phương. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Khi phỏng vấn một nhân chứng lịch sử, học sinh cần làm gì?", "options": ["Tự ý thay đổi nội dung lời kể.", "Ghi âm, ghi hình khi chưa được đồng ý.", "Lắng nghe, đặt câu hỏi phù hợp và ghi lại trung thực lời kể.", "Chỉ ghi những nội dung mình thích."], "correct": 2, "explain": "Lắng nghe, đặt câu hỏi phù hợp và ghi lại trung thực lời kể. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Vì sao cần lưu giữ những câu chuyện của người dân địa phương?", "options": ["Để giải trí.", "Để bảo tồn ký ức, lịch sử và văn hóa cộng đồng.", "Để thay thế hoàn toàn sách lịch sử.", "Chỉ để đăng tải lên mạng xã hội."], "correct": 1, "explain": "Để bảo tồn ký ức, lịch sử và văn hóa cộng đồng. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Tư liệu nào có thể được số hóa để lưu giữ ký ức địa phương?", "options": ["Bản ghi âm, video, hình ảnh và câu chuyện được ghi chép.", "Chỉ có văn bản.", "Chỉ có hình ảnh.", "Chỉ có bản đồ."], "correct": 0, "explain": "Bản ghi âm, video, hình ảnh và câu chuyện được ghi chép. — nội dung được củng cố trong tài liệu của chạm này."}], "memory": [{"q": "Ai có thể trở thành người kể chuyện về Cửa Việt?", "options": ["Chỉ có những người làm công tác nghiên cứu lịch sử.", "Chỉ có cán bộ địa phương.", "Những người từng sống, chiến đấu, lao động và gắn bó với Cửa Việt.", "Chỉ có học sinh."], "correct": 2, "explain": "Những người từng sống, chiến đấu, lao động và gắn bó với Cửa Việt. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Khi phỏng vấn người dân địa phương, học sinh cần chú ý điều gì?", "options": ["Ghi lại trung thực nội dung câu chuyện.", "Tự ý thay đổi lời kể.", "Chỉ ghi những nội dung gây chú ý.", "Không cần ghi nguồn tư liệu."], "correct": 0, "explain": "Ghi lại trung thực nội dung câu chuyện. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Những câu chuyện của ngư dân cao tuổi có thể giúp chúng ta tìm hiểu điều gì?", "options": ["Chỉ về hoạt động du lịch.", "Nghề biển, kinh nghiệm đi biển và đời sống cư dân ven biển.", "Chỉ về các công trình xây dựng.", "Chỉ về hoạt động thương mại."], "correct": 1, "explain": "Nghề biển, kinh nghiệm đi biển và đời sống cư dân ven biển. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Vì sao cần số hóa các câu chuyện của người dân?", "options": ["Để thay thế hoàn toàn việc gặp gỡ nhân chứng.", "Để lưu giữ, bảo quản và chia sẻ ký ức đến nhiều người hơn.", "Chỉ để tạo hình ảnh đẹp cho App/Web.", "Để không cần kiểm chứng thông tin."], "correct": 1, "explain": "Để lưu giữ, bảo quản và chia sẻ ký ức đến nhiều người hơn. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Việc lắng nghe và lưu giữ ký ức của người dân giúp học sinh điều gì?", "options": ["Chỉ biết thêm tên các nhân vật.", "Hiểu hơn về lịch sử, văn hóa và trân trọng giá trị quê hương.", "Không cần tìm hiểu các nguồn tư liệu khác.", "Chỉ ghi nhớ những câu chuyện giải trí."], "correct": 1, "explain": "Hiểu hơn về lịch sử, văn hóa và trân trọng giá trị quê hương. — nội dung được củng cố trong tài liệu của chạm này."}]}, "4": {"guess": [{"q": "Nghề nghiệp truyền thống gắn bó lâu đời với cư dân vùng biển Cửa Việt là gì?", "options": ["Trồng cây công nghiệp.", "Đánh bắt và khai thác thủy sản.", "Trồng lúa nước quy mô lớn.", "Chăn nuôi gia súc trên núi."], "correct": 1, "explain": "Đánh bắt và khai thác thủy sản. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Lễ hội cầu ngư của cư dân ven biển thường thể hiện mong ước nào?", "options": ["Mùa màng bội thu.", "Mưa thuận gió hòa, biển yên, đánh bắt thuận lợi.", "Phát triển công nghiệp.", "Mở rộng diện tích đất nông nghiệp."], "correct": 1, "explain": "Mưa thuận gió hòa, biển yên, đánh bắt thuận lợi. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Tri thức dân gian về nghề biển thường được hình thành từ đâu?", "options": ["Kinh nghiệm thực tế được tích lũy và truyền lại qua nhiều thế hệ.", "Chỉ từ sách giáo khoa.", "Chỉ từ các thiết bị hiện đại.", "Từ những hoạt động vui chơi giải trí."], "correct": 0, "explain": "Kinh nghiệm thực tế được tích lũy và truyền lại qua nhiều thế hệ. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Hoạt động nào góp phần giữ gìn bản sắc văn hóa làng biển?", "options": ["Không quan tâm đến phong tục truyền thống.", "Gìn giữ nghề truyền thống, lễ hội và các giá trị văn hóa địa phương.", "Thay thế toàn bộ phong tục cũ.", "Chỉ tập trung phát triển du lịch."], "correct": 1, "explain": "Gìn giữ nghề truyền thống, lễ hội và các giá trị văn hóa địa phương. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Học sinh có thể góp phần bảo tồn văn hóa làng biển bằng cách nào?", "options": ["Tìm hiểu, ghi chép và giới thiệu những nét đẹp văn hóa quê hương.", "Không tham gia các hoạt động cộng đồng.", "Không quan tâm đến nghề truyền thống.", "Chỉ tìm hiểu văn hóa ở những nơi khác."], "correct": 0, "explain": "Tìm hiểu, ghi chép và giới thiệu những nét đẹp văn hóa quê hương. — nội dung được củng cố trong tài liệu của chạm này."}], "memory": [{"q": "Nghề nghiệp gắn bó lâu đời với cư dân ven biển Cửa Việt là gì?", "options": ["Khai thác khoáng sản.", "Đánh bắt và khai thác thủy sản.", "Trồng cây công nghiệp.", "Chăn nuôi gia súc trên núi."], "correct": 1, "explain": "Đánh bắt và khai thác thủy sản. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Lễ hội cầu ngư thường thể hiện mong ước nào của cư dân ven biển?", "options": ["Biển yên, trời thuận, đánh bắt thuận lợi và cuộc sống bình an.", "Mở rộng diện tích đất nông nghiệp.", "Phát triển các khu công nghiệp.", "Tăng diện tích rừng trồng."], "correct": 0, "explain": "Biển yên, trời thuận, đánh bắt thuận lợi và cuộc sống bình an. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Tri thức dân gian về nghề biển chủ yếu được hình thành từ đâu?", "options": ["Kinh nghiệm thực tế trong lao động và cuộc sống.", "Các hoạt động vui chơi.", "Những thông tin quảng cáo.", "Các trò chơi trên mạng."], "correct": 0, "explain": "Kinh nghiệm thực tế trong lao động và cuộc sống. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Hoạt động nào góp phần gìn giữ văn hóa làng biển?", "options": ["Bỏ qua các phong tục truyền thống.", "Tìm hiểu, ghi chép và tham gia các hoạt động văn hóa phù hợp.", "Không quan tâm đến nghề truyền thống.", "Chỉ lưu giữ những hình ảnh hiện đại."], "correct": 1, "explain": "Tìm hiểu, ghi chép và tham gia các hoạt động văn hóa phù hợp. — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Vì sao cần bảo tồn các giá trị văn hóa làng biển?", "options": ["Vì đó là những giá trị gắn với bản sắc và đời sống cộng đồng.", "Vì chỉ có ý nghĩa đối với người cao tuổi.", "Vì có thể thay thế mọi hoạt động kinh tế.", "Vì không cần thay đổi trong cuộc sống hiện đại."], "correct": 0, "explain": "Vì đó là những giá trị gắn với bản sắc và đời sống cộng đồng. — nội dung được củng cố trong tài liệu của chạm này."}]}, "5": {"guess": [{"q": "Theo em, điều gì khiến Cửa Việt trở nên hấp dẫn trong mắt du khách trẻ?", "options": ["Cảnh quan thiên nhiên và bãi biển.", "Những câu chuyện lịch sử, văn hóa địa phương.", "Ẩm thực và cuộc sống làng biển.", "Những trải nghiệm khám phá, chụp ảnh và nghỉ dưỡng.", "Tất cả những yếu tố trên."], "correct": 4, "explain": "Tất cả những yếu tố trên. — nội dung được củng cố trong tài liệu của chạm này."}], "memory": [{"q": "Điều gì tạo nên sức hấp dẫn của Cửa Việt đối với du khách?", "options": ["Chỉ có cảnh quan biển", "Cảnh quan, văn hóa, con người và trải nghiệm địa phương", "Chỉ có hoạt động đánh bắt thủy sản", "Chỉ có các công trình xây dựng"], "correct": 1, "explain": "Cảnh quan, văn hóa, con người và trải nghiệm địa phương — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Hình thức nào giúp người trẻ quảng bá hình ảnh Cửa Việt hiệu quả?", "options": ["Chụp ảnh, làm video và chia sẻ thông tin có trách nhiệm", "Đăng tải thông tin chưa kiểm chứng", "Chỉ giới thiệu những nơi đông người", "Không cần tìm hiểu địa phương"], "correct": 0, "explain": "Chụp ảnh, làm video và chia sẻ thông tin có trách nhiệm — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Sản phẩm nào thể hiện sự sáng tạo của học sinh trong quảng bá du lịch?", "options": ["Tranh vẽ, poster, video giới thiệu địa phương", "Bài chép nguyên văn trên Internet", "Thông tin không có nguồn", "Hình ảnh không liên quan"], "correct": 0, "explain": "Tranh vẽ, poster, video giới thiệu địa phương — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Phát triển du lịch bền vững cần gắn với điều gì?", "options": ["Khai thác tài nguyên không giới hạn", "Chỉ quan tâm đến lợi nhuận", "Bảo vệ môi trường và gìn giữ bản sắc văn hóa", "Tăng lượng rác thải du lịch"], "correct": 2, "explain": "Bảo vệ môi trường và gìn giữ bản sắc văn hóa — nội dung được củng cố trong tài liệu của chạm này."}, {"q": "Học sinh có thể đóng góp gì cho quê hương Cửa Việt?", "options": ["Sáng tạo sản phẩm quảng bá và tham gia bảo vệ môi trường", "Thờ ơ với các giá trị địa phương", "Chỉ quan tâm đến du lịch ở nơi khác", "Không cần tìm hiểu lịch sử quê hương"], "correct": 0, "explain": "Sáng tạo sản phẩm quảng bá và tham gia bảo vệ môi trường — nội dung được củng cố trong tài liệu của chạm này."}]}});

stationDocuments["3"]["3"].html=`<h3>Thuyền cá Cửa Việt xưa và nay</h3><p>Kéo thanh trượt để quan sát thuyền gỗ và ngư cụ trong ảnh cũ, rồi nhìn sang những tàu cá ở cửa biển ngày nay. Hai ảnh được chụp từ những góc khác nhau.</p>${photoComparison(
  {src: 'assets/thuyen-va-ngu-cu.webp', alt: 'Thuyền gỗ và ngư cụ ở Cửa Việt trước đây', label: 'QUÁ KHỨ'},
  {src: 'assets/thuyen-danh-ca.webp', alt: 'Tàu cá ở cửa biển Cửa Việt hiện nay', label: 'HIỆN TẠI'},
  true
)}`;
const previousStationMarkup=stepMarkup;
function documentPhotos(items){return items.join('').replace(/@([\w]+)@/g,(_,key)=>stationAssets[key]);}
function stationCompare(p){const pair=p.id===4?['4_image3','4_image11']:['5_image2','5_image3'];return `<div class="compare-wrap ${p.id===5?'compare-cham-five':''}"><img src="${stationAssets[pair[1]]}" alt="Ảnh thứ hai trong tư liệu"><div class="compare-top"><img src="${stationAssets[pair[0]]}" alt="Ảnh thứ nhất trong tư liệu"></div><span class="compare-label">${p.id===5?'XƯA · THEO TÀI LIỆU':'NGHỀ BIỂN · ẢNH TƯ LIỆU'}</span><span class="compare-label right">${p.id===5?'NAY · THEO TÀI LIỆU':'TÀU THUYỀN · GÓC NHÌN KHÁC'}</span><span class="compare-handle"></span><input id="compare-range" type="range" min="0" max="100" value="50" aria-label="Kéo để so sánh hai ảnh"></div><div class="compare-help"><label for="compare-range">Kéo để quan sát</label><span id="compare-value">50%</span></div><p class="source-note">Ảnh từ file Chạm ${two(p.id)}; chưa có ngày chụp và tác giả đầy đủ. Hai ảnh không cùng góc chụp.</p>`;}
stepMarkup=function(p){
 if(p.id<3){
  let html=previousStationMarkup(p);
  if(p.id===2 && currentStep===0) html+=`<figure class="station-monument"><img src="https://media-cdn.xanhx.vn/storage/newsportal/2025/5/7/31352/Chien-Cong-Hien-Hach.jpg" width="1181" height="886" alt="Đài Chiến thắng Đặc công Hải quân ở bờ Bắc Cửa Việt." loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>Đài Chiến thắng Đặc công Hải quân ở bờ Bắc Cửa Việt. · <a href="https://xanhx.vn/ky-su/nhung-chien-cong-hien-hach-tren-chien-truong-quang-tri-31352.html" target="_blank" rel="noopener noreferrer">Đ.T / XANH EWEC</a></figcaption></figure>`;
  return html;
 }
 if(currentStep===1||currentStep===5)return bankMarkup(p,currentStep===1?'guess':'memory');
 const d=stationDocuments[p.id][currentStep+1];let content=d.html;
 if(currentStep===0){content+=stationLocationMarkup(p.id)+documentPhotos(d.photos);if(p.id===3)content+=`<figure class="station-monument"><img src="assets/cau-cua-viet.webp" alt="Cây cầu bắc qua vùng cửa biển Cửa Việt"><figcaption>Cây cầu qua vùng cửa biển Cửa Việt · Ảnh do bạn cung cấp.</figcaption></figure>`;}
 if(currentStep===2 && p.id===3) return `<div class="station-body">${content}</div>`;
 if(currentStep===2){content+=stationCompare(p);if(p.id===4)content+='<h4>Bộ ảnh trong tài liệu</h4><div class="station-gallery">'+documentPhotos(d.photos)+'</div>';}
 if(currentStep===3){content+=documentPhotos(d.photos)+`<div class="info-box"><p>Chưa có video phỏng vấn đính kèm trong file Word. Các câu hỏi trên là gợi ý để thực hiện phỏng vấn.</p></div><label class="listen-field">Chọn video của bạn<input type="file" id="interview-file" accept="video/*"></label><div id="interview-player"></div><p class="source-note">Video chỉ phát trên thiết bị này; không tải lên hay công khai. Chọn tư liệu đã được người kể đồng ý cho sử dụng.</p>`;}
 if(currentStep===4&&p.id!==4)content+='<div class="station-gallery">'+documentPhotos(d.photos)+'</div>';
 if(currentStep===6){content+=baseStepMarkup(p).replace(/<h3>.*?<\/h3>/,'');if(p.id===3||p.id===4)content=content.replace('maxlength="800"','maxlength="100"').replace('/800 ký tự','/100 ký tự');}
 if(currentStep===7){content=`<h3>Tiếp nối hành trình ký ức</h3><p>Chọn một điểm chạm để tiếp tục khám phá Cửa Việt.</p><div class="next-points">${points.filter(n=>n.id!==p.id).map(n=>`<button class="next-point" data-action="open-point" data-id="${n.id}"><span>${two(n.id)}</span><strong>${n.title}</strong>${icon('arrow')}</button>`).join('')}</div>`;if(p.id===5)content+=surveyMarkup();}
 const sourceNote=p.id===4&&currentStep===4
  ? 'Nội dung theo tài liệu “CHẠM 04 – HOÀN THIỆN” bạn cung cấp. Nguồn ảnh được ghi dưới từng hình.'
  : `Nội dung và hình ảnh theo tài liệu “CHẠM ${two(p.id)} – HOÀN THIỆN” bạn cung cấp.`;
 return `<div class="station-body">${content}<p class="station-source">${sourceNote} Cảm nhận được lưu riêng trên trình duyệt, chưa đăng công khai.</p></div>`;
};
function surveyMarkup(){let saved={};try{saved=JSON.parse(localStorage.getItem('cham5-survey')||'{}')}catch{};const prompts=['Điều bạn yêu thích nhất ở Cửa Việt là gì?','Bạn đánh giá như thế nào về tiềm năng du lịch Cửa Việt?','Bạn mong muốn có những hoạt động hoặc sản phẩm du lịch nào?','Bạn sẵn sàng làm gì để quảng bá và bảo vệ quê hương?'];return `<details class="timeline-entry"><summary>Khảo sát · Cửa Việt trong mắt học sinh</summary><p>Ghi lại góc nhìn và một việc bạn cam kết thực hiện. Phiếu lưu riêng trên thiết bị; tải xuống để gửi cho giáo viên.</p><form id="station-survey" class="station-survey">${prompts.map((t,i)=>`<label for="survey-${i}">${i+1}. ${t}</label><textarea id="survey-${i}" name="q${i}" maxlength="1000" required>${esc(saved['q'+i]||'')}</textarea>`).join('')}<button class="btn btn-primary" type="submit">Lưu phiếu khảo sát</button> <button class="btn btn-outline" type="button" data-action="survey-download">Tải phiếu (.txt)</button><p id="survey-feedback" role="status"></p></form></details>`;}
document.addEventListener('submit',e=>{if(e.target.id!=='station-survey')return;e.preventDefault();try{localStorage.setItem('cham5-survey',JSON.stringify(Object.fromEntries(new FormData(e.target))));$('#survey-feedback').textContent='Đã lưu phiếu trên trình duyệt này.';}catch{$('#survey-feedback').textContent='Không thể lưu trên trình duyệt. Hãy tải phiếu để giữ lại.';}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='station-photo')showUtility('Tư liệu Chạm '+two(currentPoint),`<img class="full-photo" src="${stationAssets[b.dataset.key]}" alt="${esc(b.dataset.caption)}"><p>${esc(b.dataset.caption)}</p>`);if(b.dataset.action==='survey-download'){const form=$('#station-survey');const content='KHẢO SÁT: CỬA VIỆT TRONG MẮT HỌC SINH\n\n'+Array.from(form.querySelectorAll('textarea')).map(t=>form.querySelector('label[for="'+t.id+'"]').textContent+'\n'+t.value).join('\n\n');const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Khao_sat_Cua_Viet.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}});
steps[2]='Chạm qua hình ảnh';steps[3]='Nghe người thật kể';

points.find(p=>p.id===3).text=[" KHÁM PHÁ NHỮNG CÂU CHUYỆN – LƯU GIỮ HỒN QUÊ CỬA VIỆT.  Những câu chuyện được kể không chỉ giúp chúng ta hiểu về một con người mà còn mở ra bức tranh về lịch sử, văn hóa và cuộc sống của cả một cộng đồng.  Nội dung được chia thành 4 nhóm chủ đề chính:  a. Ký ức chiến tranh – Những năm tháng không thể quên  Giới thiệu những câu chuyện về chiến tranh, tình đồng đội, sự hy sinh, tinh thần kiên cường và khát vọng hòa bình của người dân Cửa Việt.  b. Ký ức nghề biển – Một đời gắn bó với sóng nước  Khám phá những câu chuyện về nghề đánh bắt thủy sản, kinh nghiệm đi biển, phương tiện đánh bắt, những chuyến ra khơi và tình yêu biển của ngư dân.  c. Ký ức làng quê – Nếp sống và tình người  Tìm hiểu về diện mạo làng quê ngày trước, cuộc sống gia đình, quan hệ xóm giềng, sinh hoạt cộng đồng và những nét đẹp trong đời sống thường ngày.  d. Ký ức văn hóa – Những giá trị được trao truyền  Khám phá phong tục, tập quán, lễ hội cầu ngư, tín ngưỡng và những kinh nghiệm dân gian được người dân gìn giữ, truyền lại qua nhiều thế hệ. "];
points.find(p=>p.id===4).text=[" KHÁM PHÁ BẢN SẮC VĂN HÓA – CẢM NHẬN HỒN QUÊ LÀNG BIỂN.  Văn hóa làng biển được hình thành từ quá trình con người thích nghi với môi trường biển, lao động sản xuất và sinh hoạt cộng đồng. Những giá trị ấy được thể hiện qua nhiều khía cạnh của cuộc sống.  a. Nghề biển – Nhịp sống từ đại dương  Nghề đánh bắt và khai thác thủy sản là một hoạt động kinh tế gắn bó lâu đời với cư dân ven biển. Nghề biển không chỉ tạo ra nguồn sống mà còn hình thành những kinh nghiệm, kỹ năng và nếp sinh hoạt đặc trưng.  Học sinh khám phá:  Các hình thức đánh bắt thủy sản.  Phương tiện và ngư cụ truyền thống.  Hoạt động ở bến cá, chợ cá.  Những kinh nghiệm được ngư dân truyền lại.  b. Lễ hội cầu ngư – Niềm tin và khát vọng của cư dân biển  Lễ hội cầu ngư là một sinh hoạt văn hóa tín ngưỡng gắn với cộng đồng cư dân ven biển ở nhiều địa phương. Lễ hội thể hiện mong ước biển yên, trời thuận, đánh bắt thuận lợi, cuộc sống bình an và no đủ.  Học sinh tìm hiểu:  Nguồn gốc và ý nghĩa lễ hội tại địa phương.  Những nghi thức và hoạt động tiêu biểu.  Vai trò của lễ hội trong đời sống cộng đồng.  Ý thức gìn giữ các giá trị văn hóa truyền thống.  Lưu ý: Nội dung về tên gọi, thời gian, nghi thức và địa điểm tổ chức lễ hội cầu ngư tại Cửa Việt cần được học sinh xác minh qua người am hiểu văn hóa và tư liệu địa phương, không mặc định mọi địa phương đều có nghi thức giống nhau.  c. Phong tục tập quán – Nét đẹp trong đời sống cộng đồng  Cuộc sống của cư dân ven biển được gắn kết bởi nhiều phong tục và tập quán trong lao động, sinh hoạt gia đình và hoạt động cộng đồng.  Học sinh khám phá:  Những tập quán trong lao động nghề biển.  Nếp sống và sinh hoạt gia đình.  Tinh thần tương trợ, đoàn kết trong cộng đồng.  Những phong tục được lưu giữ qua nhiều thế hệ.  d. Tri thức dân gian – Kinh nghiệm từ biển cả  Qua quá trình lao động, người dân tích lũy nhiều kinh nghiệm về thời tiết, gió, sóng, thủy triều, mùa vụ và hoạt động đánh bắt.  Học sinh tìm hiểu:  Kinh nghiệm nhận biết thời tiết khi đi biển.  Cách quan sát gió, sóng và dấu hiệu tự nhiên.  Kinh nghiệm lựa chọn thời điểm ra khơi.  Các câu ca dao, tục ngữ và câu chuyện dân gian liên quan đến biển.  đ. Ẩm thực làng biển – Hương vị quê hương  Ẩm thực là một phần quan trọng trong đời sống văn hóa của cư dân ven biển, phản ánh nguồn nguyên liệu từ biển và cách chế biến được truyền qua nhiều thế hệ.  Học sinh khám phá:  Các loại hải sản đặc trưng.  Những món ăn truyền thống của gia đình và làng quê.  Cách chế biến, bảo quản thủy sản.  Những món ăn gắn với ký ức và sinh hoạt cộng đồng. "];
points.find(p=>p.id===5).text=[" Bốn không gian sáng tạo   Cửa Việt qua ống kính trẻ  Những bức ảnh đẹp về biển, cảnh quan, con người và cuộc sống địa phương.  Viết ý tưởng của bạn →    Cửa Việt qua sắc màu nghệ thuật  Tranh vẽ, thiết kế poster, thơ, bài viết và các sáng tác về quê hương.  Viết ý tưởng của bạn →    Cửa Việt – Điểm hẹn du lịch  Ý tưởng trải nghiệm, tham quan, khám phá văn hóa, ẩm thực và du lịch biển.  Viết ý tưởng của bạn →    Cửa Việt xanh trong tương lai  Ý tưởng du lịch xanh, bảo vệ môi trường và phát triển du lịch bền vững.  Viết ý tưởng của bạn →  "];

const chamTwoToday='assets/toan-canh-cua-viet.webp';
const chamOneOriginal='assets/tu-lieu-62.webp';
const chamOneToday='assets/ben-cang-hien-nay.webp';
embeddedImages.chamOneToday=chamOneToday;points.find(p=>p.id===1).image="chamOneToday";
refresh();
embeddedImages.station1="assets/ben-cang-hien-nay.webp";points.find(p=>p.id===1).image='station1';
embeddedImages.station2="assets/tuong-dai-chien-thang.webp";points.find(p=>p.id===2).image='station2';
embeddedImages.station3="assets/cau-cua-viet.webp";points.find(p=>p.id===3).image='station3';
embeddedImages.station4="assets/nhip-song-ben-ca.webp";points.find(p=>p.id===4).image='station4';
embeddedImages.station5="assets/bo-bien-cua-viet.webp";points.find(p=>p.id===5).image='station5';
refresh();
